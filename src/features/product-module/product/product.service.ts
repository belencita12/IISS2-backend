import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { ImageService } from '@features/media-module/image/image.service';
import { PrismaService } from '@features/prisma/prisma.service';
import { TagService } from '../tag/tag.service';
import { ProductFilter } from './product.filter';
import { ProductPricingService } from './product-pricing.service';
import { ProductMapper } from './product.mapper';
import { TokenPayload } from '@features/auth-module/auth/types/auth.types';
import Decimal from 'decimal.js';

@Injectable()
export class ProductService {
	constructor(
		private readonly db: PrismaService,
		private readonly imgService: ImageService,
		private readonly tagService: TagService,
		private readonly productPricingService: ProductPricingService,
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
		return ProductMapper.toDto(product);
	}

	async findAll(query: ProductQueryDto, user?: TokenPayload) {
		const isPublic = !user || user.clientId !== undefined;
		const { baseWhere } = this.db.getBaseWhere(query);
		const where = ProductFilter.getWhere(baseWhere, query);
		const [data, total] = await Promise.all([
			this.db.product.findMany({
				...this.db.paginate(query),
				...this.getInclude(),
				where,
			}),
			this.db.product.count({ where }),
		]);
		return this.db.getPagOutput({
			data: data.map((p) => ProductMapper.toDto(p, isPublic)),
			page: query.page,
			size: query.size,
			total,
		});
	}

	async findOne(id: number, user?: TokenPayload) {
		const isPublic = !user || user.clientId !== undefined;
		const prod = await this.db.product.findUnique({
			...this.getInclude(),
			where: { id },
		});
		if (!prod) throw new HttpException('Producto no encontrado', 404);
		return ProductMapper.toDto(prod, isPublic);
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

		const updatedProduct = await this.db.$transaction(
			async (tx) => {
				if (!isSameCost)
					await this.productPricingService.resetProductCostHistory(
						tx,
						prodToUpd.id,
					);
				if (!isSamePrice)
					await this.productPricingService.resetProductPriceHistory(
						tx,
						prodToUpd.id,
					);
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
			},
			{ timeout: 15000 },
		);
		return ProductMapper.toDto(updatedProduct);
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

	private getInclude() {
		return {
			include: {
				prices: { where: { isActive: true } },
				costs: { where: { isActive: true } },
				tags: { include: { tag: true } },
				image: true,
				provider: true,
			},
		};
	}

	private genProdCode() {
		const randomNumber = Math.floor(Math.random() * 100);
		const nowString = Date.now().toString();
		return `${nowString}${randomNumber}`;
	}
}
