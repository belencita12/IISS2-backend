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
import { Prisma, Product, ProductPrice } from '@prisma/client';
import Decimal from 'decimal.js';
import { StockDetailInfo } from '../dto/invoices.types';
import { InvoiceDto } from '../dto/invoice.dto';
import { InvoiceQueryDto } from '../dto/invoice-query.dto';
import { InvoicePaymentMethodDetailDto } from '../dto/invoice-payment-method-detail.dto';
import { PayCreditInvoiceDto } from '../dto/pay-credit-invoice.dto';
import { normalizeDate } from '@lib/utils/date';
import { EnvService } from '@features/global-module/env/env.service';

@Injectable()
export class InvoiceService {
	constructor(
		private readonly db: PrismaService,
		private readonly env: EnvService,
	) {}

	async create(dto: CreateInvoiceDto) {
		const {
			details,
			issueDate,
			paymentMethods,
			services,
			clientId,
			stockId,
			...restDto
		} = dto;
		const clientData = await this.manageClient(clientId);
		const invoice = await this.db.$transaction(
			async (tx) => {
				const { stamped, invoiceNumber } = await this.getInvoiceInfo(
					tx,
					dto.stockId,
					issueDate,
				);
				const { invoiceData, productData, stockDetailData, total, totalVat } =
					await this.processDetails(tx, stockId, details, services);
				await this.handleUpdateStock(tx, stockDetailData, productData);
				const createdInv = await tx.invoice.create({
					include: { client: { include: { user: true } } },
					data: {
						...restDto,
						total,
						invoiceNumber,
						stamped,
						totalVat,
						totalPayed: restDto.type === 'CASH' ? total : 0,
						issueDate: new Date(issueDate),
						client: clientData,
						stock: { connect: { id: stockId } },
						details: {
							createMany: { data: invoiceData },
						},
					},
				});
				if (restDto.type === 'CASH') {
					await this.applyPaymentMethods(
						tx,
						createdInv.id,
						paymentMethods || [],
						total,
					);
				}
				return createdInv;
			},
			{ timeout: 15000 },
		);
		return new InvoiceDto(invoice);
	}

	async payCreditInvoice(id: number, dto: PayCreditInvoiceDto) {
		const { amount, paymentDate, paymentMethods } = dto;

		const invoice = await this.db.invoice.findUnique({ where: { id } });
		if (!invoice) throw new NotFoundException('Factura no encontrada');
		if (invoice.type != 'CREDIT')
			throw new BadRequestException('Solo pueden pagarse facturas a credito');
		if (invoice.issueDate > new Date(paymentDate))
			throw new BadRequestException(
				'La fecha del recibo no puede ser anterior a la factura',
			);

		let total = 0;
		const payMethodData: Prisma.InvoicePaymentMethodCreateManyInput[] = [];

		for (const pM of paymentMethods) {
			total += pM.amount;
			payMethodData.push({
				invoiceId: id,
				amount: pM.amount,
				methodId: pM.methodId,
			});
		}

		const newTotalPayed = new Decimal(invoice.totalPayed).plus(amount);
		if (invoice.total.lessThan(newTotalPayed))
			throw new BadRequestException(
				'El pago no puede exceder al total de la factura',
			);

		if (total !== amount)
			throw new BadRequestException(
				'El monto de los metodos de pago no coincide con el monto que se intenta pagar',
			);

		const updatedInvoice = await this.db.invoice.update({
			include: { client: { include: { user: true } } },
			where: { id },
			data: {
				totalPayed: newTotalPayed,
				receipts: {
					create: {
						total: amount,
						issueDate: new Date(paymentDate),
						paymentMethods: { createMany: { data: payMethodData } },
					},
				},
			},
		});

		return new InvoiceDto(updatedInvoice);
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
		const invoice = await this.db.invoice.findUnique({ where: { id } });
		if (!invoice) throw new NotFoundException('Factura no encontrada');

		const details = await this.db.invoiceDetail.findMany({
			where: { invoiceId: id },
			select: { id: true },
		});

		await this.db.$transaction(async (tx) => {
			await Promise.all([
				tx.invoice.softDelete({ id }),
				details.map((d) => tx.invoiceDetail.softDelete({ id: d.id })),
			]);
		});
	}

	private applyFilters(dto: InvoiceQueryDto) {
		const { baseWhere } = this.db.getBaseWhere(dto);
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

	private async getInvoiceInfo(
		tx: ExtendedTransaction,
		stockId: number,
		date: string,
	) {
		const stockData = await tx.stock.findUnique({
			where: { id: stockId },
			include: { stamped: true },
		});
		if (!stockData) throw new NotFoundException('El deposito no existe');
		if (
			date > normalizeDate(stockData.stamped.toDate) ||
			date < normalizeDate(stockData.stamped.fromDate)
		)
			throw new BadRequestException(
				'La fecha de la factura es invalida para este timbrado',
			);
		if (stockData.stamped.currentNum >= stockData.stamped.toNum)
			throw new BadRequestException(
				'El timbrado ya no tiene numeros disponibles',
			);
		const stamped = stockData.stamped.stampedNum;
		const invoiceNumber = `${stockData.stockNum.toString().padStart(3, '0')}-001-${(stockData.stamped.currentNum + 1).toString().padStart(7, '0')}`;

		await tx.stamped.update({
			where: { id: stockData.stampedId },
			data: { currentNum: stockData.stamped.currentNum + 1 },
		});

		return { stamped, invoiceNumber };
	}

	private async processDetails(
		tx: ExtendedTransaction,
		stockId: number,
		details: CreateInvoiceDetailDto[],
		services: CreateInvoiceDetailDto[],
	) {
		const productsId = details.map((d) => d.productId);
		const servicesId = services.map((s) => s.productId);

		const servicesProdDetails = await tx.product.findMany({
			where: { id: { in: servicesId }, category: 'SERVICE' },
			include: {
				prices: { where: { isActive: true } },
			},
		});

		const stockDetails = await tx.stockDetails.findMany({
			where: { productId: { in: productsId }, stockId },
			include: {
				product: { include: { prices: { where: { isActive: true } } } },
			},
		});

		if (stockDetails.length !== productsId.length) {
			throw new NotFoundException(
				'Uno o mas de los productos de la lista no existen',
			);
		}

		if (servicesProdDetails.length !== servicesId.length) {
			throw new NotFoundException(
				'Uno o mas de los servicios de la lista no existen',
			);
		}

		const productsResult = this.buildProductsDetailsData(
			stockDetails,
			stockId,
			details,
		);

		const servicesResult = this.buildServiceDetailsData(
			servicesProdDetails,
			services,
		);

		const total = productsResult.total.add(servicesResult.total);
		const totalVat = productsResult.totalVat.add(servicesResult.totalVat);

		if (total.lte(0))
			throw new BadRequestException('El total no puede ser igual a 0');

		return {
			invoiceData: [
				...productsResult.invoiceData,
				...servicesResult.invoiceData,
			],
			productData: productsResult.productData,
			stockDetailData: productsResult.stockDetailData,
			total,
			totalVat,
		};
	}

	private buildServiceDetailsData(
		services: (Product & { prices: ProductPrice[] })[],
		details: CreateInvoiceDetailDto[],
	) {
		const invoiceData: Prisma.InvoiceDetailCreateManyInvoiceInput[] = [];
		let total = new Decimal(0);
		let totalVat = new Decimal(0);

		for (const d of details) {
			const service = services.find((s) => s.id === d.productId)!;

			const partialAmount = service.prices[0].amount.mul(d.quantity);
			const partialAmountVAT = partialAmount
				.mul(service.iva)
				.div(Decimal.add(100, service.iva));

			total = total.add(partialAmount);
			totalVat = totalVat.add(partialAmountVAT);

			invoiceData.push({
				partialAmount,
				partialAmountVAT,
				productId: service.id,
				quantity: d.quantity,
				unitCost: service.prices[0].amount,
			});
		}

		return { invoiceData, total, totalVat };
	}

	private async handleUpdateStock(
		tx: ExtendedTransaction,
		stockDetails: Prisma.StockDetailsUpdateArgs[],
		products: Prisma.ProductUpdateArgs[],
	) {
		await Promise.all(stockDetails.map((sd) => tx.stockDetails.update(sd)));
		await Promise.all(products.map((p) => tx.product.update(p)));
	}

	async applyPaymentMethods(
		tx: ExtendedTransaction,
		invoiceId: number,
		paymentMethods: InvoicePaymentMethodDetailDto[],
		expectedTotal?: Decimal,
	) {
		if (!paymentMethods || paymentMethods.length === 0) {
			throw new BadRequestException(
				'Es necesario especificar los métodos de pago.',
			);
		}

		const invPayMethodData: Prisma.InvoicePaymentMethodCreateManyInput[] = [];
		let total = 0;

		for (const pM of paymentMethods) {
			total += pM.amount;
			invPayMethodData.push({
				invoiceId,
				amount: pM.amount,
				methodId: pM.methodId,
			});
		}

		if (expectedTotal && !expectedTotal.eq(total)) {
			throw new BadRequestException(
				'Los montos de los métodos de pago deben coincidir con lo pagado.',
			);
		}

		await tx.invoicePaymentMethod.createMany({ data: invPayMethodData });
	}

	private buildProductsDetailsData(
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

			if (
				currentSD.amount < d.quantity ||
				currentSD.product.quantity < d.quantity
			) {
				throw new BadRequestException(
					`La cantidad en stock de "${currentSD.product.name}" es insuficiente para realizar la venta`,
				);
			}

			const partialAmount = currentSD.product.prices[0].amount.mul(d.quantity);
			const partialAmountVAT = partialAmount
				.mul(currentSD.product.iva)
				.div(Decimal.add(100, currentSD.product.iva));

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
				unitCost: currentSD.product.prices[0].amount,
			});
		}

		return { invoiceData, productData, stockDetailData, total, totalVat };
	}

	private async manageClient(clientId?: number) {
		if (clientId) {
			return { connect: { id: clientId } };
		} else {
			const genericClientId = await this.getOrCreateGenericClientId();
			return { connect: { id: genericClientId } };
		}
	}

	private async getOrCreateGenericClientId(): Promise<number> {
		const ruc = this.env.get('CLIENT_EXPRESS_RUC');
		const fullName = this.env.get('CLIENT_EXPRESS_NAME');

		let genericClient = await this.db.client.findFirst({
			where: { user: { ruc } },
			select: { id: true },
		});

		if (!genericClient) {
			const createdClient = await this.db.client.create({
				select: { id: true },
				data: {
					deletedAt: new Date(),
					user: {
						create: {
							ruc,
							fullName,
							email: ruc,
							password: ruc,
							username: fullName,
							phoneNumber: fullName,
							deletedAt: new Date(),
						},
					},
				},
			});
			genericClient = createdClient;
		}
		return genericClient.id;
	}
}
