import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateMovementDto } from './dto/movement/create-movement.dto';
import { MovementQueryDto } from './dto/movement/movement-query.dto';
import { RevertMovementDto } from './dto/movement/revert-movement.dto';
import { PrismaService } from '@features/prisma/prisma.service';

@Injectable()
export class MovementService {
	constructor(private prisma: PrismaService) {}

	async create(dto: CreateMovementDto) {
		return this.prisma.$transaction(async (prisma) => {
			const manager = await prisma.employee.findUnique({
				where: { id: dto.managerId },
			});
			if (!manager) {
				throw new BadRequestException(
					`El empleado con ID ${dto.managerId} no existe.`,
				);
			}
			this.validateRequiredFields(dto);
			await this.validateStockExistence(
				dto.originStockId,
				dto.destinationStockId,
			);
			const movement = await prisma.movement.create({
				data: {
					description: dto.description,
					managerId: dto.managerId,
					type: dto.type,
					dateMovement: dto.dateMovement ?? new Date(),
					originStockId: dto.originStockId ?? null,
					destinationStockId: dto.destinationStockId ?? null,
				},
			});
			for (const detail of dto.details) {
				if (detail.quantity <= 0) {
					throw new BadRequestException(
						`La cantidad debe ser un valor positivo para el producto ${detail.productId}.`,
					);
				}
				await this.validateStockAvailability(
					detail.productId,
					dto.originStockId!,
					detail.quantity,
					dto.type,
				);
				await this.updateStockQuantities(
					prisma,
					detail.productId,
					dto.originStockId!,
					dto.destinationStockId!,
					detail.quantity,
					dto.type,
				);
				await prisma.movementDetail.create({
					data: {
						movementId: movement.id,
						productId: detail.productId,
						quantity: detail.quantity,
					},
				});
			}
			return movement;
		});
	}

	async findAll(dto: MovementQueryDto) {
		const validTypes = ['INBOUND', 'OUTBOUND', 'TRANSFER'];
		if (dto.type && !validTypes.includes(dto.type)) {
			throw new BadRequestException(`Tipo de movimiento inválido: ${dto.type}`);
		}
		const { baseWhere } = this.prisma.getBaseWhere(dto);
		const where: Prisma.MovementWhereInput = {
			...baseWhere,
			managerId: dto.managerId,
			type: dto.type,
			dateMovement: dto.dateMovement
				? { gte: new Date(dto.dateMovement) }
				: undefined,
			originStockId: dto.originStockId ? Number(dto.originStockId) : undefined,
			destinationStockId: dto.destinationStockId
				? Number(dto.destinationStockId)
				: undefined,
		};

		const [data, total] = await Promise.all([
			this.prisma.movement.findMany({
				...this.prisma.paginate(dto),
				where,
				include: {
					originStock: true,
					destinationStock: true,
				},
			}),
			this.prisma.movement.count({ where }),
		]);

		return this.prisma.getPagOutput({
			page: dto.page,
			size: dto.size,
			total,
			data,
		});
	}

	async findOne(id: number) {
		const movement = await this.prisma.movement.findUnique({
			where: { id },
			include: { details: true },
		});
		if (!movement) {
			throw new NotFoundException(`Movimiento con id ${id} no encontrada`);
		}
		return movement;
	}

	async revertMovement(movementId: number, dto: RevertMovementDto = {}) {
		const originalMovement = await this.findOne(movementId);
		if (originalMovement.type !== 'TRANSFER') {
			throw new BadRequestException(
				`Solo se pueden revertir transferencias. El movimiento ${movementId} es de tipo ${originalMovement.type}.`,
			);
		}
		if (!originalMovement.details || originalMovement.details.length === 0) {
			throw new BadRequestException(
				`El movimiento ${movementId} no tiene detalles para revertir.`,
			);
		}
		const revertDto: CreateMovementDto = {
			description:
				dto.description ||
				`Reversión de "${originalMovement.description || `Movimiento #${movementId}`}"`,
			managerId: dto.managerId || originalMovement.managerId,
			type: 'TRANSFER',
			dateMovement: new Date(),
			originStockId: originalMovement.destinationStockId || undefined,
			destinationStockId: originalMovement.originStockId || undefined,
			details: originalMovement.details.map((detail) => ({
				productId: detail.productId,
				quantity: detail.quantity,
			})),
		};
		const revertedMovement = await this.create(revertDto);
		return revertedMovement;
	}

	async remove(id: number) {
		const exists = await this.prisma.movement.findUnique({
			where: { id },
		});
		if (!exists) {
			throw new NotFoundException('Movimiento no encontrado');
		}
		await this.prisma.movement.update({
			where: { id },
			data: { deletedAt: new Date() },
		});
		await this.prisma.movementDetail.updateMany({
			where: { movementId: id },
			data: { deletedAt: new Date() },
		});
		return { message: 'Movimiento marcado como eliminado correctamente' };
	}

	private async validateStockExistence(
		originStockId: number | undefined,
		destinationStockId: number | undefined,
	) {
		if (originStockId !== undefined) {
			const originStock = await this.prisma.stock.findUnique({
				where: { id: originStockId },
			});
			if (!originStock) {
				throw new NotFoundException(
					`Stock de origen con ID ${originStockId} no encontrado.`,
				);
			}
		}
		if (destinationStockId !== undefined) {
			const destinationStock = await this.prisma.stock.findUnique({
				where: { id: destinationStockId },
			});
			if (!destinationStock) {
				throw new NotFoundException(
					`Stock de destino con ID ${destinationStockId} no encontrado.`,
				);
			}
		}
	}

	private validateRequiredFields(dto: CreateMovementDto) {
		if (dto.type === 'TRANSFER') {
			if (
				dto.originStockId === undefined ||
				dto.destinationStockId === undefined
			) {
				throw new BadRequestException(
					'Para movimientos de tipo TRANSFER, originStockId y destinationStockId son obligatorios',
				);
			}
			if (dto.originStockId === dto.destinationStockId) {
				throw new BadRequestException(
					'El stock de origen y destino no pueden ser el mismo para un movimiento de tipo TRANSFER',
				);
			}
		} else if (dto.type === 'INBOUND') {
			if (dto.destinationStockId === undefined) {
				throw new BadRequestException(
					'Para movimientos de tipo INBOUND, destinationStockId es obligatorio',
				);
			}
		} else if (dto.type === 'OUTBOUND') {
			if (dto.originStockId === undefined) {
				throw new BadRequestException(
					'Para movimientos de tipo OUTBOUND, originStockId es obligatorio',
				);
			}
		} else {
			throw new BadRequestException('Tipo de movimiento inválido');
		}
	}

	private async validateStockAvailability(
		productId: number,
		stockId: number,
		quantity: number,
		type?: string,
	) {
		if (type === 'INBOUND') {
			return;
		}
		const stockDetail = await this.prisma.stockDetails.findFirst({
			where: { stockId, productId },
		});
		if (!stockDetail) {
			throw new BadRequestException(
				`El producto con ID ${productId} no existe en el stock con ID ${stockId}.`,
			);
		}
		if (stockDetail.amount < quantity) {
			throw new BadRequestException(
				`Stock insuficiente para producto ${productId} en stock ${stockId}. Disponible: ${stockDetail.amount}, solicitado: ${quantity}`,
			);
		}
	}

	private async updateStockQuantities(
		prisma,
		productId: number,
		originStockId: number,
		destinationStockId: number,
		quantity: number,
		type: string,
	) {
		const validTypes = ['INBOUND', 'OUTBOUND', 'TRANSFER'];
		if (!validTypes.includes(type)) {
			throw new BadRequestException(`Tipo de movimiento inválido: ${type}`);
		}
		if (type === 'INBOUND') {
			await this.handleInbound(prisma, productId, destinationStockId, quantity);
		} else if (type === 'TRANSFER') {
			await this.handleTransfer(
				prisma,
				productId,
				originStockId,
				destinationStockId,
				quantity,
			);
		} else if (type === 'OUTBOUND') {
			await this.handleOutbound(prisma, productId, originStockId, quantity);
		}
	}

	private async handleTransfer(
		prisma,
		productId: number,
		originStockId: number,
		destinationStockId: number,
		quantity: number,
	) {
		const originStockDetail = await prisma.stockDetails.findFirst({
			where: { stockId: originStockId, productId },
		});
		if (!originStockDetail) {
			throw new BadRequestException(
				`El producto con ID ${productId} no existe en el stock de origen con ID ${originStockId}.`,
			);
		}
		if (originStockDetail.amount < quantity) {
			throw new BadRequestException(
				`Stock insuficiente para producto ${productId} en stock ${originStockId}. Disponible: ${originStockDetail.amount}, solicitado: ${quantity}`,
			);
		}
		const updateOriginResult = await prisma.stockDetails.updateMany({
			where: { stockId: originStockId, productId },
			data: { amount: { decrement: quantity } },
		});
		if (updateOriginResult.count === 0) {
			throw new Error(
				`Fallo al actualizar el stock de origen para productId: ${productId} en stockId: ${originStockId}.`,
			);
		}
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
				data: {
					stockId: destinationStockId,
					productId,
					amount: quantity,
				},
			});
		}
	}
	private async handleInbound(
		prisma,
		productId: number,
		destinationStockId: number,
		quantity: number,
	) {
		await prisma.stockDetails.updateMany({
			where: { stockId: destinationStockId, productId },
			data: { amount: { increment: quantity } },
		});
	}

	private async handleOutbound(
		prisma,
		productId: number,
		originStockId: number,
		quantity: number,
	) {
		await prisma.stockDetails.updateMany({
			where: { stockId: originStockId, productId },
			data: { amount: { decrement: quantity } },
		});
	}
}
