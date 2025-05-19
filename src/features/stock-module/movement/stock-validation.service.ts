import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { MovementType } from '@prisma/client';
import {
	ExtendedTransaction,
	PrismaService,
} from '@features/prisma/prisma.service';
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
		tx: ExtendedTransaction,
		productId: number,
		quantity: number,
		type: MovementType,
		ogStockId?: number,
		destStockId?: number,
	) {
		if (type === MovementType.INBOUND)
			return this.handleInbound(tx, productId, destStockId!, quantity);
		else if (type === MovementType.TRANSFER)
			return this.handleTransfer(
				tx,
				productId,
				ogStockId!,
				destStockId!,
				quantity,
			);
		else if (type === MovementType.OUTBOUND)
			return this.handleOutbound(tx, productId, ogStockId!, quantity);
	}

	async validateAndProcessDetail(
		tx: ExtendedTransaction,
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
			tx,
			detail.productId,
			detail.quantity,
			movDto.type,
			movDto.originStockId,
			movDto.destinationStockId,
		);
		await tx.movementDetail.create({
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
		tx: ExtendedTransaction,
		productId: number,
		destStockId: number,
		quantity: number,
	) {
		const isProdExists = await tx.product.isExists({ id: productId });
		if (!isProdExists) throw new BadRequestException('Producto no encontrado');

		await tx.product.update({
			where: { id: productId },
			data: { quantity: { increment: quantity } },
		});

		await tx.stockDetails.upsert({
			where: {
				stockId_productId: {
					stockId: destStockId,
					productId: productId,
				},
			},
			update: {
				amount: {
					increment: quantity,
				},
			},
			create: {
				stockId: destStockId,
				productId: productId,
				amount: quantity,
			},
		});
	}

	private async handleOutbound(
		tx: ExtendedTransaction,
		productId: number,
		originStockId: number,
		quantity: number,
	) {
		const isProdExists = await tx.product.isExists({ id: productId });
		if (!isProdExists) throw new BadRequestException('Producto no encontrado');
		await tx.product.update({
			where: { id: productId },
			data: { quantity: { decrement: quantity } },
		});
		await tx.stockDetails.update({
			where: { stockId_productId: { productId, stockId: originStockId } },
			data: { amount: { decrement: quantity } },
		});
	}
}
