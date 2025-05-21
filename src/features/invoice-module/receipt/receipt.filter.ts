import { Prisma } from '@prisma/client';
import { ReceiptQueryDto } from './dto/receipt-query.dto';
import { RangeValidation } from '@lib/utils/range-validation';
import { BadRequestException } from '@nestjs/common';

export class ReceiptFilter {
	static getWhere(where: Prisma.ReceiptWhereInput, dto: ReceiptQueryDto) {
		if (
			dto.fromTotal &&
			dto.toTotal &&
			!RangeValidation.isValidRangeNum(dto.fromTotal, dto.toTotal)
		) {
			throw new BadRequestException('El rango de totales no es valido');
		}

		if (
			dto.fromIssueDate &&
			dto.toIssueDate &&
			!RangeValidation.isValidRangeStr(dto.fromIssueDate, dto.toIssueDate)
		)
			throw new BadRequestException(
				'El rango de fechas de factura no es valido',
			);

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
