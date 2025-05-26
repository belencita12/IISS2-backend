import { PrismaService } from '@features/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ReceiptQueryDto } from './dto/receipt-query.dto';
import { ReceiptMapper } from './receipt.mapper';
import { ReceiptFilter } from './receipt.filter';
import { ReceiptData } from '@lib/types/invoice-pdf';
import { PdfService } from '@features/global-module/pdf/pdf.service';
import { Response } from 'express';

@Injectable()
export class ReceiptService {
	constructor(
		private readonly db: PrismaService,
		private readonly pdfService: PdfService,
	) {}

	async findAll(query: ReceiptQueryDto) {
		const { baseWhere } = this.db.getBaseWhere(query);
		const where = ReceiptFilter.getWhere(baseWhere, query);
		const [data, count] = await Promise.all([
			this.db.receipt.findMany({
				...this.db.paginate(query),
				...this.getInclude(),
				where,
			}),
			this.db.receipt.count({ where }),
		]);
		return this.db.getPagOutput({
			page: query.page,
			size: query.size,
			total: count,
			data: data.map((r) => ReceiptMapper.toDto(r)),
		});
	}

	async findOne(id: number) {
		const receipt = await this.db.receipt.findUnique({
			...this.getInclude(),
			where: { id },
		});
		if (!receipt) throw new NotFoundException('El recibo no fue encontrado');
		return ReceiptMapper.toDto(receipt);
	}

	private getInclude() {
		return { include: { paymentMethods: { include: { method: true } } } };
	}

	async generatePDF(id: number, res: Response): Promise<void> {
		const receipt = await this.db.receipt.findUnique({
			where: { id },
			include: {
				Invoice: {
					include: { client: { include: { user: true } } },
				},
				paymentMethods: { include: { method: true } },
			},
		});
		if (!receipt) throw new NotFoundException('Recibo no encontrado');
		const invoice = receipt.Invoice;
		if (!invoice)
			throw new NotFoundException('Factura relacionada no encontrada');
		const formattedReceipt: ReceiptData = {
			receiptNumber: receipt.receiptNumber.toString(),
			issueDate: receipt.issueDate,
			amount:
				typeof receipt.total === 'object' && 'toNumber' in receipt.total
					? receipt.total.toNumber()
					: Number(receipt.total),
			client: {
				fullName: invoice.client.user.fullName,
				ruc: invoice.client.user.ruc,
			},
			paymentMethods: receipt.paymentMethods.map((pm) => ({
				method: { name: pm.method.name },
				amount: pm.amount,
			})),
			invoice: {
				invoiceNumber: invoice.invoiceNumber,
				issueDate: invoice.issueDate,
				stamped: invoice.stamped,
				type: invoice.type,
				totalIVA:
					typeof invoice.totalVat === 'object' && 'toNumber' in invoice.totalVat
						? invoice.totalVat.toNumber()
						: Number(invoice.totalVat),
				totalToPay:
					typeof invoice.total === 'object' && 'toNumber' in invoice.total
						? invoice.total.toNumber()
						: Number(invoice.total),
			},
		};

		this.pdfService.generateReceiptPDF(formattedReceipt, res);
	}
}
