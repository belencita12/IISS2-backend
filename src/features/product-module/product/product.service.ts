import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductDto } from './dto/product.dto';
import Decimal from 'decimal.js';
import { ProductQueryDto } from './dto/product-query.dto';
import { Prisma } from '@prisma/client';
import { ImageService } from '@features/media-module/image/image.service';
import {
	ExtendedTransaction,
	PrismaService,
} from '@features/prisma/prisma.service';
import { TagService } from '../tag/tag.service';

@Injectable()
export class ProductService {
	constructor(
		private readonly db: PrismaService,
		private readonly imgService: ImageService,
		private readonly tagService: TagService,
	) {}

	async create(dto: CreateProductDto) {
		const { price, productImg, tags, cost, ...rest } = dto;

		if (dto.category !== 'SERVICE' && !dto.providerId) {
			throw new BadRequestException(
				'El producto debe pertenecer a un proveedor',
			);
		}

		const prodImg = productImg
			? await this.imgService.create(productImg)
			: null;
		const product = await this.db.$transaction(
			async (tx) => {
				const product = await tx.product.create({
					data: {
						...rest,
						code: this.genProdCode(),
						category: rest.category,
						imageId: prodImg ? prodImg.id : undefined,
						tags: tags ? this.tagService.connectTags(tags) : undefined,
						prices: { create: { amount: new Decimal(price) } },
						costs: { create: { cost: new Decimal(cost) } },
					},
					...this.getInclude(),
				});
				return product;
			},
			{ timeout: 15000 },
		);
		return new ProductDto(product);
	}

	async findAll(query: ProductQueryDto) {
		const where = this.getWhere(query);
		const [data, total] = await Promise.all([
			this.db.product.findMany({
				...this.db.paginate(query),
				...this.getInclude(),
				where,
			}),
			this.db.product.count({ where }),
		]);
		return this.db.getPagOutput({
			page: query.page,
			size: query.size,
			total,
			data: data.map((p) => new ProductDto(p)),
		});
	}

	async findOne(id: number) {
		const prod = await this.db.product.findUnique({
			...this.getInclude(),
			where: { id },
		});
		if (!prod) throw new HttpException('Producto no encontrado', 404);
		return new ProductDto(prod);
	}

	async update(id: number, dto: CreateProductDto) {
		const prodToUpd = await this.db.product.findUnique({
			...this.getInclude(),
			where: { id },
		});

		if (!prodToUpd) throw new HttpException('Producto no encontrado', 404);

		const { price, cost, productImg, tags = [], ...rest } = dto;
		const prodImg = await this.imgService.upsert(prodToUpd.image, productImg);
		const isSamePrice = prodToUpd.prices[0].amount.eq(price);
		const isSameCost = prodToUpd.costs[0].cost.eq(cost);
		const prevTags = prodToUpd.tags;

		const updatedProduct = await this.db.$transaction(async (tx) => {
			if (!isSameCost) await this.resetProductCostHistory(tx, prodToUpd.id);
			if (!isSamePrice) await this.resetProductPriceHistory(tx, prodToUpd.id);
			const updatedProduct = await tx.product.update({
				...this.getInclude(),
				where: { id },
				data: {
					...rest,
					category: rest.category,
					tags: this.tagService.handleUpdateTags(prevTags, tags),
					imageId: prodImg ? prodImg.id : undefined,
					costs: !isSameCost
						? { create: { cost: new Decimal(cost) } }
						: undefined,
					prices: !isSamePrice
						? { create: { amount: new Decimal(price) } }
						: undefined,
				},
			});
			return updatedProduct;
		});
		return new ProductDto(updatedProduct);
	}

	async remove(id: number) {
		const product = await this.db.product.findUnique({
			where: { id },
			select: { id: true },
		});
		if (!product) throw new HttpException('Producto no encontrado', 404);
		await this.db.$transaction(async (tx) => {
			await tx.product.softDelete({ id });
			await tx.stockDetails.updateMany({
				where: { productId: product.id },
				data: { deletedAt: new Date() },
			});
		});
	}

	async resetProductCostHistory(tx: ExtendedTransaction, productId: number) {
		await tx.productCost.updateMany({
			where: { productId, isActive: true },
			data: { isActive: false },
		});
	}

	async resetProductPriceHistory(tx: ExtendedTransaction, productId: number) {
		await tx.productPrice.updateMany({
			where: { productId, isActive: true },
			data: { isActive: false },
		});
	}

	private getWhere(query: ProductQueryDto) {
		const { baseWhere } = this.db.getBaseWhere(query);
		const where: Prisma.ProductWhereInput = {
			...baseWhere,
			name: { contains: query.name, mode: 'insensitive' },
			code: { contains: query.code },
			providerId: query.providerId,
			category: query.category,
			costs:
				query.minCost || query.maxCost
					? {
							some: {
								isActive: true,
								cost: { gte: query.minCost, lte: query.maxCost },
							},
						}
					: undefined,
			prices:
				query.minPrice || query.maxPrice
					? {
							some: {
								isActive: true,
								amount: { gte: query.minPrice, lte: query.maxPrice },
							},
						}
					: undefined,
			StockDetails: query.stockId
				? { some: { stockId: query.stockId } }
				: undefined,
			tags: query.tags
				? { some: { tag: { name: { in: query.tags } } } }
				: undefined,
		};
		return where;
	}

	private getInclude() {
		return {
			include: {
				prices: { where: { isActive: true } },
				costs: { where: { isActive: true } },
				tags: { include: { tag: true } },
				image: true,
			},
		};
	}

	private genProdCode() {
		const randomNumber = Math.floor(Math.random() * 100);
		const nowString = Date.now().toString();
		return `${nowString}${randomNumber}`;
	}
}
