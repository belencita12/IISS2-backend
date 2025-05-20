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

		if (query.fromDate) {
			where.fromDate = { gte: new Date(query.fromDate) };
		}

		if (query.toDate) {
			const toDate = new Date(query.toDate);
			toDate.setDate(toDate.getDate() + 1);
			where.toDate = { lte: toDate };
		}

		return where;
	}
}
