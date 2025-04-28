import { HttpException, Injectable } from '@nestjs/common';
import { CreateProductPriceDto } from './dto/create-product-price.dto';
import { ProductPriceQueryDto } from './dto/product-price-query.dto';
import { Prisma } from '@prisma/client';
import {
	ExtendedTransaction,
	PrismaService,
} from '@features/prisma/prisma.service';

@Injectable()
export class ProductPriceService {
	constructor(private readonly db: PrismaService) {}

	async create(tx: ExtendedTransaction, dto: CreateProductPriceDto) {
		const newProductPrice = await tx.productPrice.create({ data: dto });
		this.desactivateExceptById(tx, newProductPrice.id);
		return newProductPrice;
	}

	async findAll(query: ProductPriceQueryDto) {
		const { baseWhere } = this.db.getBaseWhere(query);
		const mountQuery = { gte: query.fromAmount, lte: query.toAmount };
		const where: Prisma.ProductPriceWhereInput = {
			...baseWhere,
			amount: mountQuery,
		};
		const [data, total] = await Promise.all([
			this.db.productPrice.findMany({
				...this.db.paginate(query),
				where,
			}),
			this.db.productPrice.count({ where }),
		]);
		return this.db.getPagOutput({
			page: query.page,
			size: query.size,
			total,
			data,
		});
	}

	async findOne(id: number) {
		const price = await this.db.productPrice.findUnique({
			where: { id, deletedAt: null },
		});
		if (!price) throw new HttpException('Precio no encontrado', 404);
		return price;
	}

	async desactivateExceptById(tx: ExtendedTransaction, id: number) {
		await tx.productPrice.updateMany({
			where: { id: { not: id } },
			data: { isActive: false },
		});
	}

	async remove(id: number) {
		const price = await this.db.productPrice.findUnique({ where: { id } });
		if (!price) throw new HttpException('Precio no encontrado', 404);
		await this.db.productPrice.update({
			where: { id },
			data: { deletedAt: new Date() },
		});
	}
}
