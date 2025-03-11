import { HttpException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductDto } from './dto/product.dto';
import { ImageService } from '@/image/image.service';
import { PrismaService } from '@/prisma/prisma.service';
import Decimal from 'decimal.js';
import { Category, Prisma } from '@prisma/client';
import { ProductQueryDto } from './dto/product-query.dto';

@Injectable()
export class ProductService {
	constructor(
		private readonly db: PrismaService,
		private readonly imgService: ImageService,
	) {}

	async create(dto: CreateProductDto) {
		const { price, productImg, ...rest } = dto;
		const prodImg = productImg
			? await this.imgService.create(productImg)
			: null;
		const prod = await this.db.product.create({
			data: {
				...rest,
				code: this.genProdCode(),
				category: rest.category || Category.PRODUCT,
				image: prodImg ? { connect: { id: prodImg.id } } : undefined,
				price: {
					create: {
						amount: new Decimal(price),
					},
				},
			},
			include: {
				price: true,
				image: true,
			},
		});
		return new ProductDto(prod);
	}

	async findAll(query: ProductQueryDto) {
		const { baseWhere } = this.db.getBaseWhere(query);
		const where: Prisma.ProductWhereInput = {
			...baseWhere,
			name: { contains: query.name },
			code: { contains: query.code },
			category: query.category,
			cost: { gte: query.minCost, lte: query.maxCost },
			price: { amount: { gte: query.minPrice, lte: query.maxPrice } },
		};
		const [data, total] = await Promise.all([
			this.db.product.findMany({
				...this.db.paginate(query),
				where,
				include: { price: true, image: true },
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
			where: { id },
			include: {
				price: true,
				image: true,
			},
		});
		if (!prod) throw new HttpException('Product not found', 404);
		return new ProductDto(prod);
	}

	async update(id: number, dto: CreateProductDto) {
		const prodToUpd = await this.db.product.findUnique({
			where: { id },
			include: { image: true, price: true },
		});

		if (!prodToUpd) throw new HttpException('Product not found', 404);

		const { price, productImg, ...rest } = dto;
		const prodImg = await this.imgService.upsert(prodToUpd.image, productImg);
		const isSamePrice = prodToUpd.price.amount.eq(price);

		const prod = await this.db.product.update({
			where: { id },
			data: {
				...rest,
				image: prodImg ? { connect: { id: prodImg.id } } : undefined,
				price: isSamePrice
					? { connect: { id: prodToUpd.price.id } }
					: { create: { amount: new Decimal(price) } },
			},
			include: {
				price: true,
				image: true,
			},
		});
		if (!prod) throw new HttpException('Error al actualizar el producto', 500);
		return new ProductDto(prod);
	}

	async remove(id: number) {
		await this.db.product.update({
			where: { id },
			data: { deletedAt: new Date() },
		});
	}

	private genProdCode() {
		const randomNumber = Math.floor(Math.random() * 10000);
		const nowString = Date.now().toString();
		return `prod-${nowString}-${randomNumber}`;
	}
}
