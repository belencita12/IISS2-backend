import { HttpException, Injectable } from '@nestjs/common';
import { ProductPriceQueryDto } from './dto/product-price-query.dto';
import { Prisma } from '@prisma/client';
import {
	ExtendedTransaction,
	PrismaService,
} from '@features/prisma/prisma.service';
import { ProductPriceDto } from './dto/product-price.dto';

@Injectable()
export class ProductPriceService {
	constructor(private readonly db: PrismaService) {}

	async findAll(query: ProductPriceQueryDto) {
		const where = this.getFindAllWhere(query);
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
			data: data.map((pp) => new ProductPriceDto(pp)),
		});
	}

	async findOne(id: number) {
		const price = await this.db.productPrice.findUnique({
			where: { id, deletedAt: null },
		});
		if (!price) throw new HttpException('Precio no encontrado', 404);
		return new ProductPriceDto(price);
	}

	async desactivateExceptById(
		tx: ExtendedTransaction,
		productId: number,
		id: number,
	) {
		await tx.productPrice.updateMany({
			where: { id: { not: id }, productId },
			data: { isActive: false },
		});
	}

	async remove(id: number) {
		const price = await this.db.productPrice.isExists({ id });
		if (!price) throw new HttpException('Precio no encontrado', 404);
		return await this.db.productPrice.softDelete({ id });
	}

	private getFindAllWhere(query: ProductPriceQueryDto) {
		const { baseWhere } = this.db.getBaseWhere(query);
		const where: Prisma.ProductPriceWhereInput = { ...baseWhere };

		if (query.fromAmount || query.toAmount) {
			where.amount = { gte: query.fromAmount, lte: query.toAmount };
		}
		if (query.productId) where.productId = query.productId;
		if (query.active !== undefined) where.isActive = query.active;

		return where;
	}
}
