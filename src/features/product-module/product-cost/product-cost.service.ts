import { HttpException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
	ExtendedTransaction,
	PrismaService,
} from '@features/prisma/prisma.service';
import { ProductCostQueryDto } from './dto/product-cost-query.dto';
import { ProductCostDto } from './dto/product-cost.dto';

@Injectable()
export class ProductCostService {
	constructor(private readonly db: PrismaService) {}

	async findAll(query: ProductCostQueryDto) {
		const where = this.getWhere(query);
		const [data, total] = await Promise.all([
			this.db.productCost.findMany({
				...this.db.paginate(query),
				where,
			}),
			this.db.productCost.count({ where }),
		]);
		return this.db.getPagOutput({
			page: query.page,
			size: query.size,
			total,
			data: data.map((pc) => new ProductCostDto(pc)),
		});
	}

	async findOne(id: number) {
		const cost = await this.db.productCost.findUnique({
			where: { id, deletedAt: null },
		});
		if (!cost) throw new HttpException('Costo no encontrado', 404);
		return new ProductCostDto(cost);
	}

	async desactivateExceptById(
		tx: ExtendedTransaction,
		productId: number,
		id: number,
	) {
		await tx.productCost.updateMany({
			where: { id: { not: id }, productId },
			data: { isActive: false },
		});
	}

	async remove(id: number) {
		const cost = await this.db.productCost.findUnique({ where: { id } });
		if (!cost) throw new HttpException('Costo no encontrado', 404);
		await this.db.productCost.update({
			where: { id },
			data: { deletedAt: new Date() },
		});
	}

	private getWhere(query: ProductCostQueryDto) {
		const { baseWhere } = this.db.getBaseWhere(query);
		const where: Prisma.ProductCostWhereInput = { ...baseWhere };
		if (query.productId) where.productId = query.productId;
		if (query.isActive !== undefined) where.isActive = query.isActive;
		if (query.fromCost || query.toCost) {
			where.cost = { gte: query.fromCost, lte: query.toCost };
		}
		return where;
	}
}
