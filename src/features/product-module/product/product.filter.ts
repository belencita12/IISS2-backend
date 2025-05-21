import { Prisma } from '@prisma/client';
import { ProductQueryDto } from './dto/product-query.dto';

export class ProductFilter {
	static getWhere(baseWhere: Prisma.ProductWhereInput, query: ProductQueryDto) {
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
}
