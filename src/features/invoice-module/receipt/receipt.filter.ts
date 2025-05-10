import { Prisma } from '@prisma/client';
import { ReceiptQueryDto } from './dto/receipt-query.dto';

export class ReceiptFilter {
	static getWhere(where: Prisma.ReceiptWhereInput, dto: ReceiptQueryDto) {
		if (dto.receiptNumber) {
			where.receiptNumber = dto.receiptNumber;
		}
		if (dto.paymentMethodId) {
			where.paymentMethods = { some: { methodId: dto.paymentMethodId } };
		}
		if (dto.searchTerm) {
			where.Invoice = {
				OR: [
					{ invoiceNumber: { contains: dto.searchTerm, mode: 'insensitive' } },
					{
						client: {
							user: {
								fullName: { contains: dto.searchTerm, mode: 'insensitive' },
							},
						},
					},
					{
						client: {
							user: { ruc: { contains: dto.searchTerm, mode: 'insensitive' } },
						},
					},
				],
			};
		}
		if (dto.fromTotal || dto.toTotal) {
			where.total = { gte: dto.fromTotal, lte: dto.toTotal };
		}
		if (dto.fromIssueDate || dto.toIssueDate) {
			where.issueDate = {
				gte: dto.fromIssueDate ? new Date(dto.fromIssueDate) : undefined,
				lte: dto.toIssueDate ? new Date(dto.toIssueDate) : undefined,
			};
		}
		return where;
	}
}
