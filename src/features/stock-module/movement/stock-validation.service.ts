import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { MovementType } from '@prisma/client';
import { PrismaService } from '@features/prisma/prisma.service';

@Injectable()
export class StockValidationService {
	constructor(private prisma: PrismaService) {}

	async validateStockExistence(
		originStockId?: number,
		destinationStockId?: number,
	) {
		if (originStockId) {
			const originStock = await this.prisma.stock.findUnique({
				where: { id: originStockId },
			});
			if (!originStock)
				throw new NotFoundException(
					`Stock origen ${originStockId} no encontrado`,
				);
		}
		if (destinationStockId) {
			const destinationStock = await this.prisma.stock.findUnique({
				where: { id: destinationStockId },
			});
			if (!destinationStock)
				throw new NotFoundException(
					`Stock destino ${destinationStockId} no encontrado`,
				);
		}
	}

	async validateStockAvailability(
		productId: number,
		stockId: number,
		quantity: number,
		type: MovementType,
	) {
		if (type === MovementType.INBOUND) return;

		const stockDetail = await this.prisma.stockDetails.findFirst({
			where: { stockId, productId },
		});
		if (!stockDetail)
			throw new BadRequestException(
				`Producto ${productId} no existe en stock ${stockId}`,
			);
		if (stockDetail.amount < quantity)
			throw new BadRequestException(
				`Stock insuficiente: ${stockDetail.amount} disponible, ${quantity} solicitado`,
			);
	}

	async updateStockQuantities(
		prisma: any,
		productId: number,
		originStockId: number | undefined,
		destinationStockId: number | undefined,
		quantity: number,
		type: MovementType,
	) {
		if (type === MovementType.INBOUND)
			return this.handleInbound(
				prisma,
				productId,
				destinationStockId!,
				quantity,
			);
		if (type === MovementType.TRANSFER)
			return this.handleTransfer(
				prisma,
				productId,
				originStockId!,
				destinationStockId!,
				quantity,
			);
		if (type === MovementType.OUTBOUND)
			return this.handleOutbound(prisma, productId, originStockId!, quantity);
	}

	private async handleTransfer(
		prisma: any,
		productId: number,
		originStockId: number,
		destinationStockId: number,
		quantity: number,
	) {
		const originStockDetail = await prisma.stockDetails.findFirst({
			where: { stockId: originStockId, productId },
		});
		if (!originStockDetail)
			throw new BadRequestException(
				`Producto ${productId} no existe en stock origen ${originStockId}`,
			);
		if (originStockDetail.amount < quantity)
			throw new BadRequestException(
				`Stock insuficiente: ${originStockDetail.amount} disponible, ${quantity} solicitado`,
			);

		await prisma.stockDetails.updateMany({
			where: { stockId: originStockId, productId },
			data: { amount: { decrement: quantity } },
		});

		const destinationStockDetail = await prisma.stockDetails.findFirst({
			where: { stockId: destinationStockId, productId },
		});

		if (destinationStockDetail) {
			await prisma.stockDetails.updateMany({
				where: { stockId: destinationStockId, productId },
				data: { amount: { increment: quantity } },
			});
		} else {
			await prisma.stockDetails.create({
				data: { stockId: destinationStockId, productId, amount: quantity },
			});
		}
	}

	private async handleInbound(
		prisma: any,
		productId: number,
		destinationStockId: number,
		quantity: number,
	) {
		const productExists = await prisma.product.findUnique({
			where: { id: productId },
		});
		if (!productExists)
			throw new BadRequestException(`Producto ${productId} no encontrado.`);

		const stockExists = await prisma.stock.findUnique({
			where: { id: destinationStockId },
		});
		if (!stockExists)
			throw new BadRequestException(
				`Stock ${destinationStockId} no encontrado.`,
			);

		const stockDetail = await prisma.stockDetails.findFirst({
			where: { stockId: destinationStockId, productId },
		});

		if (!stockDetail)
			await prisma.stockDetails.create({
				data: { stockId: destinationStockId, productId, amount: quantity },
			});
		else
			await prisma.stockDetails.updateMany({
				where: { stockId: destinationStockId, productId },
				data: { amount: { increment: quantity } },
			});
	}

	private async handleOutbound(
		prisma: any,
		productId: number,
		originStockId: number,
		quantity: number,
	) {
		const result = await prisma.stockDetails.updateMany({
			where: { stockId: originStockId, productId },
			data: { amount: { decrement: quantity } },
		});
		if (!result.count)
			throw new BadRequestException(
				`Producto ${productId} no existe en stock ${originStockId}`,
			);
	}
}
