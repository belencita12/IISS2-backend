import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { MovementType, Prisma } from '@prisma/client';
import { CreateMovementDto } from './dto/movement/create-movement.dto';
import { MovementQueryDto } from './dto/movement/movement-query.dto';
import { RevertMovementDto } from './dto/movement/revert-movement.dto';
import { PrismaService } from '@features/prisma/prisma.service';
import { StockValidationService } from './stock-validation.service';

@Injectable()
export class MovementService {
	constructor(
		private prisma: PrismaService,
		private stockValidation: StockValidationService,
	) {}

	async create(dto: CreateMovementDto) {
		return this.prisma.$transaction(async (prisma) => {
			const manager = await prisma.employee.findUnique({
				where: { id: dto.managerId },
			});
			if (!manager)
				throw new BadRequestException(
					`El empleado con ID ${dto.managerId} no existe`,
				);
			this.validateRequiredFields(dto);
			await this.stockValidation.validateStockExistence(
				dto.originStockId,
				dto.destinationStockId,
			);
			const movement = await prisma.movement.create({
				data: {
					description: dto.description,
					managerId: dto.managerId,
					type: dto.type,
					dateMovement: dto.dateMovement
						? new Date(dto.dateMovement)
						: new Date(),
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
				await this.stockValidation.validateStockAvailability(
					detail.productId,
					dto.originStockId!,
					detail.quantity,
					dto.type,
				);
				await this.stockValidation.updateStockQuantities(
					prisma,
					detail.productId,
					dto.originStockId,
					dto.destinationStockId,
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
		const { baseWhere } = this.prisma.getBaseWhere(dto);
		const where: Prisma.MovementWhereInput = {
			...baseWhere,
			type: dto.type,
			dateMovement:
				dto.fromDate && dto.toDate
					? { gte: dto.fromDate, lte: dto.toDate }
					: dto.fromDate
						? { gte: dto.fromDate }
						: dto.toDate
							? { lte: dto.toDate }
							: undefined,
			manager: dto.managerRuc
				? { user: { ruc: { contains: dto.managerRuc, mode: 'insensitive' } } }
				: undefined,
			originStockId: dto.originStockId,
			destinationStockId: dto.destinationStockId,
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
		if (!movement)
			throw new NotFoundException(`Movimiento ${id} no encontrado`);
		return movement;
	}

	async revertMovement(movementId: number, dto: RevertMovementDto = {}) {
		const originalMovement = await this.findOne(movementId);
		if (originalMovement.type !== MovementType.TRANSFER)
			throw new BadRequestException(
				`Solo se pueden revertir transferencias. Tipo: ${originalMovement.type}`,
			);
		if (!originalMovement.details?.length)
			throw new BadRequestException(
				`Movimiento ${movementId} sin detalles para revertir`,
			);
		const revertDto: CreateMovementDto = {
			description:
				dto.description ||
				`Reversión de "${originalMovement.description || `Movimiento #${movementId}`}"`,
			managerId: dto.managerId || originalMovement.managerId,
			type: MovementType.TRANSFER,
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
		if (!exists) throw new NotFoundException('Movimiento no encontrado');
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

	private validateRequiredFields(dto: CreateMovementDto) {
		if (dto.type === MovementType.TRANSFER) {
			if (!dto.originStockId || !dto.destinationStockId)
				throw new BadRequestException(
					'originStockId y destinationStockId requeridos',
				);
			if (dto.originStockId === dto.destinationStockId)
				throw new BadRequestException(
					'Stocks origen y destino deben ser diferentes',
				);
		} else if (dto.type === MovementType.INBOUND && !dto.destinationStockId)
			throw new BadRequestException('destinationStockId requerido');
		else if (dto.type === MovementType.OUTBOUND && !dto.originStockId)
			throw new BadRequestException('originStockId requerido');
	}
}
