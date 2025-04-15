import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import {
	ExtendedTransaction,
	PrismaService,
} from '@features/prisma/prisma.service';
import { CreateInvoiceDetailDto } from '../dto/create-invoice-detail.dto';
import { Prisma } from '@prisma/client';
import Decimal from 'decimal.js';
import { StockDetailInfo } from '../dto/invoices.types';
import { InvoiceDto } from '../dto/invoice.dto';
import { InvoiceQueryDto } from '../dto/invoice-query.dto';

@Injectable()
export class InvoiceService {
	constructor(private readonly db: PrismaService) {}

	async create(dto: CreateInvoiceDto) {
		const { details, ...data } = dto;
		const invoice = await this.db.$transaction(async (tx) => {
			const { invoiceData, productData, stockDetailData, total, totalVat } =
				await this.processDetails(tx, details, data.stockId);
			this.validateTotalPayed(total, data.totalPayed);
			await this.handleUpdateStock(tx, stockDetailData, productData);
			return await tx.invoice.create({
				include: { client: { include: { user: true } } },
				data: {
					...data,
					totalPayed: data.type === 'CASH' ? total : data.totalPayed,
					total,
					totalVat,
					details: {
						createMany: { data: invoiceData },
					},
				},
			});
		});
		return new InvoiceDto(invoice);
	}

	async findAll(dto: InvoiceQueryDto) {
		const where = this.applyFilters(dto);
		const [data, count] = await Promise.all([
			this.db.invoice.findMany({
				...this.db.paginate(dto),
				include: { client: { include: { user: true } } },
				where,
			}),
			this.db.invoice.count({ where }),
		]);
		return this.db.getPagOutput({
			total: count,
			page: dto.page,
			size: dto.size,
			data: data.map((i) => new InvoiceDto(i)),
		});
	}

	async findOne(id: number) {
		const invoice = await this.db.invoice.findUnique({
			include: { client: { include: { user: true } } },
			where: { id },
		});
		if (!invoice) throw new NotFoundException('Factura no encontrada');
		return new InvoiceDto(invoice);
	}

	async remove(id: number) {
		const isExists = await this.db.invoice.isExists({ id });
		if (!isExists) throw new NotFoundException('Factura no encontrada');
		await this.db.invoice.softDelete({ id });
	}

	private applyFilters(dto: InvoiceQueryDto) {
		const { baseWhere } = this.db.getBaseWhere(dto);
		const where: Prisma.InvoiceWhereInput = {
			...baseWhere,
			stockId: dto.stockId,
			type: dto.type,
			client: dto.ruc
				? { user: { ruc: { contains: dto.ruc, mode: 'insensitive' } } }
				: undefined,
			issueDate:
				dto.fromIssueDate || dto.toIssueDate
					? { gte: dto.fromIssueDate, lte: dto.toIssueDate }
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

	private async processDetails(
		tx: ExtendedTransaction,
		details: CreateInvoiceDetailDto[],
		stockId: number,
	) {
		const productsId = details.map((d) => d.productId);
		const stockDetails = await tx.stockDetails.findMany({
			where: { productId: { in: productsId }, stockId },
			include: {
				product: { include: { price: { select: { amount: true } } } },
			},
		});

		if (stockDetails.length !== productsId.length)
			throw new NotFoundException(
				'Uno o mas de los productos de la lista no existe o no se encuentra en el deposito',
			);

		return this.buildInvoiceDetailsData(stockDetails, stockId, details);
	}

	private async handleUpdateStock(
		tx: ExtendedTransaction,
		stockDetails: Prisma.StockDetailsUpdateArgs[],
		products: Prisma.ProductUpdateArgs[],
	) {
		await Promise.all(stockDetails.map((sd) => tx.stockDetails.update(sd)));
		await Promise.all(products.map((p) => tx.product.update(p)));
	}

	private buildInvoiceDetailsData(
		products: StockDetailInfo[],
		stockId: number,
		details: CreateInvoiceDetailDto[],
	) {
		const productData: Prisma.ProductUpdateArgs[] = [];
		const stockDetailData: Prisma.StockDetailsUpdateArgs[] = [];
		const invoiceData: Prisma.InvoiceDetailCreateManyInvoiceInput[] = [];

		let total: Decimal = new Decimal(0);
		let totalVat: Decimal = new Decimal(0);

		for (const d of details) {
			const currentSD = products.find((p) => p.product.id === d.productId)!;

			if (currentSD.amount < d.quantity) {
				throw new BadRequestException(
					`La cantidad en stock de "${currentSD.product.name}" es insuficiente para realizar la venta`,
				);
			}

			const partialAmount = currentSD.product.price.amount.mul(d.quantity);
			const partialAmountVAT = partialAmount
				.mul(currentSD.product.iva)
				.div(Decimal.add(1, currentSD.product.iva));

			total = total.add(partialAmount);
			totalVat = totalVat.add(partialAmountVAT);

			productData.push({
				where: { id: d.productId },
				data: { quantity: { decrement: d.quantity } },
			});

			stockDetailData.push({
				where: {
					stockId_productId: {
						stockId,
						productId: d.productId,
					},
				},
				data: { amount: { decrement: d.quantity } },
			});

			invoiceData.push({
				partialAmount,
				partialAmountVAT,
				productId: currentSD.product.id,
				quantity: d.quantity,
				unitCost: currentSD.product.price.amount,
			});
		}

		return { invoiceData, productData, stockDetailData, total, totalVat };
	}

	private validateTotalPayed(total: Decimal, totalPayed: number) {
		const isTotalPayedValid = total.gte(totalPayed);
		if (!isTotalPayedValid)
			throw new BadRequestException(
				'Lo pagado por la factura no puede ser mayor al total de la misma',
			);
	}
}
