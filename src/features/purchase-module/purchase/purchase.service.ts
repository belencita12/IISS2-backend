import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { Prisma } from '@prisma/client';
import {
	ExtendedTransaction,
	PrismaService,
} from '@features/prisma/prisma.service';
import { PurchaseQueryDto } from './dto/purchase-query.dto';
import { PurchaseDto } from './dto/purchase.dto';
import { PurchaseDetailService } from '../purchase-detail/purchase-detail.service';
import { CreatePurchaseDetailDto } from '../purchase-detail/dto/create-purchase-detail.dto';

@Injectable()
export class PurchaseService {
	constructor(
		private readonly db: PrismaService,
		private readonly purchaseDetailService: PurchaseDetailService,
	) {}
	async create(dto: CreatePurchaseDto) {
		return this.db.$transaction(async (tx: ExtendedTransaction) => {
			const { details, ...data } = dto;

			const isStock = await tx.stock.isExists({ id: dto.stockId });
			if (!isStock) throw new NotFoundException('Depósito no encontrado');

			const isProvider = await tx.provider.isExists({
				id: dto.providerId,
			});
			if (!isProvider) throw new NotFoundException('Proveedor no encontrado');

			const { id: purchaseId } = await tx.purchase.create({
				data: { ...data, ivaTotal: 0, total: 0 },
				select: { id: true },
			});

			if (details) await this.processPurchaseDetails(tx, details, purchaseId);

			const purchase = await tx.purchase.findUnique({
				where: { id: purchaseId },
				include: { provider: true, stock: true },
			});

			if (!purchase) throw new Error('Error al crear la compra');

			return new PurchaseDto(purchase);
		});
	}

	async findAll(dto: PurchaseQueryDto) {
		const { baseWhere } = this.db.getBaseWhere(dto);
		const where: Prisma.PurchaseWhereInput = {
			...baseWhere,
			stockId: dto.stockId,
			providerId: dto.providerId,
		};
		const [data, total] = await Promise.all([
			this.db.purchase.findMany({
				...this.db.paginate(dto),
				include: { provider: true, stock: true },
				where,
			}),
			this.db.purchase.count({ where }),
		]);
		return this.db.getPagOutput({
			page: dto.page,
			size: dto.size,
			total,
			data: data.map((s) => new PurchaseDto(s)),
		});
	}

	async findOne(id: number) {
		const purchase = await this.db.purchase.findUnique({
			where: { id },
			include: { provider: true, stock: true },
		});
		if (!purchase) throw new NotFoundException('Compra no encontrado');
		return new PurchaseDto(purchase);
	}

	private async processPurchaseDetails(
		tx: ExtendedTransaction,
		details: CreatePurchaseDetailDto[],
		purchaseId: number,
	) {
		for (const detail of details) {
			await this.purchaseDetailService.create(
				tx,
				detail.productId,
				detail.quantity,
				purchaseId,
			);
		}
	}
}
