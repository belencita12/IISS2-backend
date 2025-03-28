import { HttpException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductDto } from './dto/product.dto';
import Decimal from 'decimal.js';
import { ProductQueryDto } from './dto/product-query.dto';
import { Prisma } from '@prisma/client';
import { ImageService } from '@features/media-module/image/image.service';
import { PrismaService } from '@features/prisma/prisma.service';
import { TagService } from '../tag/tag.service';

@Injectable()
export class ProductService {
	constructor(
		private readonly db: PrismaService,
		private readonly imgService: ImageService,
		private readonly tagService: TagService,
	) { }

	async create(dto: CreateProductDto) {
		const { price, productImg, tags, ...rest } = dto;
		const prodImg = productImg
			? await this.imgService.create(productImg)
			: null;
		const tagIds = await this.tagService.getOrCreateTags(tags || []);
		const prod = await this.db.product.create({
			data: {
				...rest,
				code: this.genProdCode(),
				category: rest.category,
				image: prodImg ? { connect: { id: prodImg.id } } : undefined,
				price: {
					create: {
						amount: new Decimal(price),
					},
				},
				tags: { create: tagIds.map(tagId => ({ tagId })) },
			},
			include: {
				price: true,
				image: true,
				tags: { include: { tag: true } }
			},
		});
		return new ProductDto(prod);
	}

	async findAll(query: ProductQueryDto) {
		const { baseWhere } = this.db.getBaseWhere(query);
		const where: Prisma.ProductWhereInput = {
			...baseWhere,
			name: { contains: query.name, mode: 'insensitive' },
			code: { contains: query.code },
			category: query.category,
			cost: { gte: query.minCost, lte: query.maxCost },
			price: { amount: { gte: query.minPrice, lte: query.maxPrice } },
		};
		const [data, total] = await Promise.all([
			this.db.product.findMany({
				...this.db.paginate(query),
				where,
				include: { price: true, image: true , tags: { include: { tag: true } },},
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
				tags: { include: { tag: true } }
			},
		});
		if (!prod) throw new HttpException('Producto no encontrado', 404);
		return new ProductDto(prod);
	}

	async update(id: number, dto: CreateProductDto) {
		const prodToUpd = await this.db.product.findUnique({
			where: { id },
			include: { image: true, price: true, tags: true },
		});

		if (!prodToUpd) throw new HttpException('Producto no encontrado', 404);

		const { price, productImg, tags, ...rest } = dto;
		const prodImg = await this.imgService.upsert(prodToUpd.image, productImg);
		const isSamePrice = prodToUpd.price.amount.eq(price);

		const newTagIds = await this.tagService.getOrCreateTags(tags || []);
		const existingTagIds = prodToUpd.tags.map(t => t.tagId);
		// Identificar etiquetas a eliminar y agregar
		const tagsToDelete = existingTagIds.filter(tagId => !newTagIds.includes(tagId));
		const tagsToAdd = newTagIds.filter(tagId => !existingTagIds.includes(tagId));

		const prod = await this.db.product.update({
			where: { id },
			data: {
				...rest,
				image: prodImg ? { connect: { id: prodImg.id } } : undefined,
				price: isSamePrice
					? { connect: { id: prodToUpd.price.id } }
					: { create: { amount: new Decimal(price) } },
				tags: {
					deleteMany: { tagId: { in: tagsToDelete } },
					create: tagsToAdd.map(tagId => ({ tagId })),
				},
			},
			include: {
				price: true,
				image: true,
				tags: { include: { tag: true } }
			},
		});
		if (!prod) throw new HttpException('Error al actualizar el producto', 500);
		return new ProductDto(prod);
	}

	async remove(id: number) {
		const exists = await this.db.product.isExists({ id });
		if (!exists) throw new HttpException('Producto no encontrado', 404);
		await this.db.product.softDelete({ id });
	}

	private genProdCode() {
		const randomNumber = Math.floor(Math.random() * 10000);
		const nowString = Date.now().toString();
		return `prod-${nowString}-${randomNumber}`;
	}

}
