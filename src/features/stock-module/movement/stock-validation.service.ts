import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { MovementType } from '@prisma/client';
import { PrismaService } from '@features/prisma/prisma.service';
import { CreateMovementDetailDto } from './dto/movement-detail/create-movement-detail.dto';
import { CreateMovementDto } from './dto/movement/create-movement.dto';

@Injectable()
export class StockValidationService {
	constructor(private db: PrismaService) {}

	async validateStockExistence(
		originStockId?: number,
		destinationStockId?: number,
	) {
		if (originStockId) {
			const originStock = await this.db.stock.isExists({
				id: originStockId,
			});
			if (!originStock)
				throw new NotFoundException('Deposito origen no encontrado');
		}
		if (destinationStockId) {
			const destinationStock = await this.db.stock.isExists({
				id: destinationStockId,
			});
			if (!destinationStock)
				throw new NotFoundException('Deposito destino no encontrado');
		}
	}

	async validateStockAvailability(
		productId: number,
		stockId: number,
		quantity: number,
		type: MovementType,
	) {
		if (type === 'INBOUND') return;

		const stockDetail = await this.db.stockDetails.findFirst({
			where: {
				stockId,
				productId,
				amount: { gte: quantity },
			},
		});

		if (!stockDetail)
			throw new BadRequestException(
				`Stock insuficiente o producto ${productId} no existe en deposito ${stockId} `,
			);
	}

	async updateStockQuantities(
		prisma: any,
		productId: number,
		quantity: number,
		type: MovementType,
		ogStockId?: number,
		destStockId?: number,
	) {
		if (type === MovementType.INBOUND)
			return this.handleInbound(prisma, productId, destStockId!, quantity);
		else if (type === MovementType.TRANSFER)
			return this.handleTransfer(
				prisma,
				productId,
				ogStockId!,
				destStockId!,
				quantity,
			);
		else if (type === MovementType.OUTBOUND)
			return this.handleOutbound(prisma, productId, ogStockId!, quantity);
	}

	async validateAndProcessDetail(
		prisma: any,
		movId: number,
		movDto: CreateMovementDto,
		detail: Omit<CreateMovementDetailDto, 'movementId'>,
	) {
		await this.validateStockAvailability(
			detail.productId,
			movDto.originStockId!,
			detail.quantity,
			movDto.type,
		);
		await this.updateStockQuantities(
			prisma,
			detail.productId,
			detail.quantity,
			movDto.type,
			movDto.originStockId,
			movDto.destinationStockId,
		);
		await prisma.movementDetail.create({
			data: { movementId: movId, ...detail },
		});
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
		destStockId: number,
		quantity: number,
	) {
		const isProdExists = await prisma.product.isExists({ id: productId });
		if (!isProdExists) throw new BadRequestException('Producto no encontrado');

		const stockDetail = await prisma.stockDetails.findFirst({
			where: { stockId: destStockId, productId },
			select: { id: true },
		});

		if (!stockDetail.id) {
			await prisma.stockDetails.create({
				data: { stockId: destStockId, productId, amount: quantity },
			});
		} else {
			console.log('Se actualizo stcok');
			await prisma.stockDetails.update({
				where: { id: stockDetail.id },
				data: { amount: { increment: quantity } },
			});
		}
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
