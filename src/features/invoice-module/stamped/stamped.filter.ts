import { Prisma } from '@prisma/client';
import { StampedQueryDto } from './dto/stamped-query.dto';

export class StampedFilter {
	static getWhere(base: Prisma.StampedWhereInput, query: StampedQueryDto) {
		const where: Prisma.StampedWhereInput = { ...base };

		if (query.stockId) {
			where.stockId = query.stockId;
		}

		if (query.stamped) {
			where.stampedNum = { contains: query.stamped, mode: 'insensitive' };
		}

		if (query.fromDate || query.toDate) {
			const toDate = query.toDate ? new Date(query.toDate) : undefined;
			if (toDate) toDate.setDate(toDate.getDate() + 1);
			where.fromDate = {
				gte: query.fromDate ? new Date(query.fromDate) : undefined,
				lte: toDate,
			};
		}

		return where;
	}
}
