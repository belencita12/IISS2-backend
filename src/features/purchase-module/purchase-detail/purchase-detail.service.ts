import { Injectable, NotFoundException } from '@nestjs/common';

import {
	ExtendedTransaction,
	PrismaService,
} from '@features/prisma/prisma.service';
import { PurchaseDetailQueryDto } from './dto/purchase-detail-query.dto';
import { MovementType, Prisma } from '@prisma/client';
import { PurchaseDetailDto } from './dto/purchase-detail.dto';
import Decimal from 'decimal.js';
import { StockValidationService } from '@features/stock-module/movement/stock-validation.service';

@Injectable()
export class PurchaseDetailService {
	constructor(
		private prisma: PrismaService,
		private stockValidation: StockValidationService,
	) {}
	async create(
		tx: ExtendedTransaction,
		productId: number,
		quantity: number,
		purchaseId: number,
	) {
		const purchase = await tx.purchase.findUnique({
			where: { id: purchaseId },
		});
		if (!purchase) throw new NotFoundException('Compra no encontrada');

		const product = await tx.product.findUnique({
			where: { id: productId },
			include: { price: true, image: true },
		});
		if (!product) throw new NotFoundException('Producto no encontrado');

		const unitCost = new Decimal(product.cost);
		const quantityDec = new Decimal(quantity);
		const ivaPercentage = new Decimal(product.iva);
		const partialAmount = unitCost.mul(quantity);
		const ivaAmount = partialAmount.mul(ivaPercentage);
		const partialAmountVAT = partialAmount.add(ivaAmount);

		const purchaseDetail = await tx.purchaseDetail.create({
			data: {
				purchaseId,
				productId,
				unitCost: unitCost.toNumber(),
				partialAmount: partialAmount.toNumber(),
				partialAmountVAT: partialAmountVAT.toNumber(),
				quantity: quantityDec.toNumber(),
			},
		});

		await tx.product.update({
			where: { id: productId },
			data: {
				quantity: {
					increment: quantity,
				},
			},
		});

		await this.stockValidation.updateStockQuantities(
			tx,
			productId,
			quantity,
			MovementType.INBOUND,
			undefined,
			purchase.stockId,
		);

		await this.updatePurchaseTotals(tx, purchaseId);

		return purchaseDetail;
	}

	async findAll(dto: PurchaseDetailQueryDto) {
		return await this.filter(dto);
	}

	async findOne(id: number) {
		const purchaseDetail = await this.prisma.purchaseDetail.findUnique({
			where: { id },
			include: { product: { include: { price: true, image: true } } },
		});
		if (!purchaseDetail)
			throw new NotFoundException('Detalle de compra no encontrado');
		return new PurchaseDetailDto(purchaseDetail);
	}

	async remove(id: number) {
		const exists = await this.prisma.purchaseDetail.isExists({ id });
		if (!exists) throw new NotFoundException('Detalle compra no encontrado');
		await this.prisma.purchaseDetail.softDelete({ id });
	}

	private async filter(dto: PurchaseDetailQueryDto) {
		const { baseWhere } = this.prisma.getBaseWhere(dto);
		const where: Prisma.PurchaseDetailWhereInput = {
			...baseWhere,
			...(dto.purchaseId && { purchaseId: dto.purchaseId }),
			...(dto.productName && {
				product: { name: { contains: dto.productName, mode: 'insensitive' } },
			}),
		};
		const [data, total] = await Promise.all([
			this.prisma.purchaseDetail.findMany({
				include: {
					product: {
						include: {
							price: true,
							image: true,
							tags: { include: { tag: true } },
						},
					},
				},
				...this.prisma.paginate(dto),
				where,
			}),
			this.prisma.purchaseDetail.count({ where }),
		]);
		return this.prisma.getPagOutput({
			page: dto.page,
			size: dto.size,
			total,
			data: data.map((s) => new PurchaseDetailDto(s)),
		});
	}

	private async updatePurchaseTotals(
		tx: ExtendedTransaction,
		purchaseId: number,
	) {
		const purchaseDetails = await tx.purchaseDetail.findMany({
			where: { purchaseId },
			include: { product: true },
		});

		const { totalIva, total } = purchaseDetails.reduce(
			(acc, detail) => {
				const detailAmount = new Decimal(detail.partialAmount);
				const productVATRate = new Decimal(detail.product.iva);
				const calculatedVAT = detailAmount.times(productVATRate);
				const calculatedTotal = detailAmount.plus(calculatedVAT);
				return {
					totalIva: acc.totalIva.add(calculatedVAT),
					total: acc.total.add(calculatedTotal),
				};
			},
			{ totalIva: new Decimal(0), total: new Decimal(0) },
		);
		await tx.purchase.update({
			where: { id: purchaseId },
			data: {
				ivaTotal: totalIva.toNumber(),
				total: total.toNumber(),
			},
		});
	}
}
