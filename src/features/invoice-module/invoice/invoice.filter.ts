import { Prisma } from '@prisma/client';
import { InvoiceQueryDto } from '../dto/invoice-query.dto';

export class InvoiceFilter {
	static getWhere(baseWhere: Prisma.InvoiceWhereInput, dto: InvoiceQueryDto) {
		const where: Prisma.InvoiceWhereInput = {
			...baseWhere,
			stockId: dto.stockId,
			type: dto.type,
			client: dto.search
				? {
						OR: [
							{ user: { ruc: { contains: dto.search, mode: 'insensitive' } } },
							{
								user: {
									fullName: { contains: dto.search, mode: 'insensitive' },
								},
							},
						],
					}
				: undefined,
			issueDate:
				dto.fromIssueDate || dto.toIssueDate
					? {
							gte: dto.fromIssueDate ? new Date(dto.fromIssueDate) : undefined,
							lte: dto.toIssueDate ? new Date(dto.toIssueDate) : undefined,
						}
					: undefined,
			total:
				dto.fromTotal || dto.toTotal
					? {
							gte: dto.fromTotal,
							lte: dto.toTotal,
						}
					: undefined,
		};
		return where;
	}
}
