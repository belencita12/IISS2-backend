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
import { MovementDto } from './dto/movement/movement.dto';

@Injectable()
export class MovementService {
	constructor(
		private readonly db: PrismaService,
		private readonly stockValidation: StockValidationService,
	) {}

	async create(dto: CreateMovementDto) {
		const {
			details,
			originStockId,
			destinationStockId,
			type,
			isReverse,
			...data
		} = dto;

		this.validateMovementDto(dto);
		await this.stockValidation.validateStockExistence(
			dto.originStockId,
			dto.destinationStockId,
		);

		const manager = await this.db.employee.isExists({ id: dto.managerId });
		if (!manager) throw new BadRequestException('Empleado no encontrado');

		const movId = await this.db.$transaction(async (tx) => {
			const { id: movId } = await tx.movement.create({
				data: {
					...data,
					type,
					isReversable: !isReverse,
					originStockId: type === 'INBOUND' ? undefined : originStockId,
					destinationStockId:
						type === 'OUTBOUND' ? undefined : destinationStockId,
				},
				select: { id: true },
			});

			for (const detail of details) {
				await this.stockValidation.validateAndProcessDetail(
					tx,
					movId,
					dto,
					detail,
				);
			}
			return movId;
		});
		return await this.findOne(movId);
	}

	async findAll(dto: MovementQueryDto) {
		return await this.filter(dto);
	}

	async findOne(id: number) {
		const movement = await this.db.movement.findUnique({
			where: { id },
			include: {
				manager: { include: { user: true } },
				originStock: true,
				destinationStock: true,
			},
		});
		if (!movement)
			throw new NotFoundException(`Movimiento ${id} no encontrado`);
		return new MovementDto(movement);
	}

	async revertMovement(movementId: number, dto: RevertMovementDto = {}) {
		const mov = await this.db.movement.findUnique({
			where: { id: movementId, isReversable: true },
			include: { details: true },
		});

		if (!mov)
			throw new NotFoundException(`El movmiento no existe o ya fue revertido`);

		if (mov.type !== MovementType.TRANSFER)
			throw new BadRequestException(
				'El tipo de movimiento no se puede revertir',
			);

		if (!mov.details.length)
			throw new BadRequestException(
				'El movimiento no contiene detalles para revertir',
			);

		await this.db.movement.update({
			where: { id: movementId },
			data: { isReversable: false },
		});

		const revertDto: CreateMovementDto = {
			description:
				dto.description ||
				`Reversión de "${mov.description || `Movimiento #${movementId}`}"`,
			managerId: dto.managerId || mov.managerId,
			isReverse: true,
			type: MovementType.TRANSFER,
			dateMovement: new Date(),
			originStockId: mov.destinationStockId || undefined,
			destinationStockId: mov.originStockId || undefined,
			details: mov.details.map((detail) => ({
				productId: detail.productId,
				quantity: detail.quantity,
			})),
		};

		const revertedMovement = await this.create(revertDto);
		return revertedMovement;
	}

	async remove(id: number) {
		const exists = await this.db.movement.findUnique({
			where: { id },
		});
		if (!exists) throw new NotFoundException('Movimiento no encontrado');
		await this.db.movement.update({
			where: { id },
			data: { deletedAt: new Date() },
		});
		await this.db.movementDetail.updateMany({
			where: { movementId: id },
			data: { deletedAt: new Date() },
		});
		return { message: 'Movimiento marcado como eliminado correctamente' };
	}

	private async filter(dto: MovementQueryDto) {
		const { baseWhere } = this.db.getBaseWhere(dto);
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
			details: dto.productName
				? {
						some: {
							product: {
								name: { contains: dto.productName, mode: 'insensitive' },
							},
						},
					}
				: undefined,
		};

		const [data, total] = await Promise.all([
			this.db.movement.findMany({
				...this.db.paginate(dto),
				where,
				include: {
					manager: { include: { user: true } },
					originStock: true,
					destinationStock: true,
					details: {
						include: {
							product: true,
						},
					},
				},
			}),
			this.db.movement.count({ where }),
		]);

		return this.db.getPagOutput({
			page: dto.page,
			size: dto.size,
			total,
			data: data.map((m) => new MovementDto(m)),
		});
	}

	private validateMovementDto(dto: CreateMovementDto) {
		const { type, originStockId, destinationStockId, details } = dto;

		if (!details || !details.length)
			throw new BadRequestException('Debe haber al menos un detalle');

		if (details.some((d) => d.quantity <= 0))
			throw new BadRequestException(
				'Todas las cantidades deben ser mayores a cero',
			);

		switch (type) {
			case MovementType.TRANSFER:
				if (
					!originStockId ||
					!destinationStockId ||
					originStockId === destinationStockId
				)
					throw new BadRequestException(
						'Los depósitos origen y destino deben ser diferentes y válidos',
					);
				break;
			case MovementType.INBOUND:
				if (!destinationStockId)
					throw new BadRequestException('Depósito destino requerido');
				break;
			case MovementType.OUTBOUND:
				if (!originStockId)
					throw new BadRequestException('Depósito origen requerido');
				break;
		}
	}
}
