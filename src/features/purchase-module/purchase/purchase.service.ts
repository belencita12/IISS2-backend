import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@features/prisma/prisma.service';
import { PurchaseQueryDto } from './dto/purchase-query.dto';
import { PurchaseDto } from './dto/purchase.dto';
import { PurchaseDetailService } from '../purchase-detail/purchase-detail.service';

@Injectable()
export class PurchaseService {
	constructor(
		private prisma: PrismaService,
		private purchaseDetailService: PurchaseDetailService,
	) {}
	async create(dto: CreatePurchaseDto) {
		const isStockExists = await this.prisma.stock.findUnique({
			where: { id: dto.stockId },
		});
		if (!isStockExists) throw new NotFoundException('Depósito no encontrado');

		const isProviderExists = await this.prisma.provider.findUnique({
			where: { id: dto.providerId },
		});
		if (!isProviderExists)
			throw new NotFoundException('Proveedor no encontrado');
		const purchase = await this.prisma.purchase.create({
			data: {
				stockId: dto.stockId,
				providerId: dto.providerId,
				ivaTotal: 0,
				total: 0,
				date: dto.date,
			},
		});
		if (dto.details && dto.details.length > 0) {
			for (const detail of dto.details) {
				await this.purchaseDetailService.create(
					detail.productId,
					detail.quantity,
					purchase.id,
				);
			}
		}

		const updatedPurchase = await this.prisma.purchase.findUnique({
			where: { id: purchase.id },
		});

		if (!updatedPurchase) {
			throw new Error('No se pudo recuperar la compra actualizada');
		}
		return new PurchaseDto(updatedPurchase);
	}
	async findAll(dto: PurchaseQueryDto) {
		const { baseWhere } = this.prisma.getBaseWhere(dto);
		const where: Prisma.PurchaseWhereInput = {
			...baseWhere,
			stockId: dto.stockId,
			providerId: dto.providerId,
		};
		const [data, total] = await Promise.all([
			this.prisma.purchase.findMany({
				...this.prisma.paginate(dto),
				where,
			}),
			this.prisma.purchase.count({ where }),
		]);
		return this.prisma.getPagOutput({
			page: dto.page,
			size: dto.size,
			total,
			data: data.map((s) => new PurchaseDto(s)),
		});
	}

	async findOne(id: number) {
		const purchase = await this.prisma.purchase.findUnique({
			where: { id },
		});
		if (!purchase) throw new NotFoundException('Compra no encontrado');
		return new PurchaseDto(purchase);
	}
}
