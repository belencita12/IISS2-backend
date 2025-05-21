import {
	ExtendedTransaction,
	PrismaService,
} from '@features/prisma/prisma.service';
import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { CreateStampedDto } from './dto/create-stamped.dto';
import { StampedQueryDto } from './dto/stamped-query.dto';
import { StampedFilter } from './stamped.filter';
import { StampedValidationService } from './stamped-validation.service';
import { StampedMapper } from './stamped.mapper';

@Injectable()
export class StampedService {
	constructor(private readonly db: PrismaService) {}

	async create(dto: CreateStampedDto) {
		this.validateDtoRanges(dto);
		const stamped = await this.db.$transaction(async (tx) => {
			await this.resetStampedsByStockId(tx, dto.stockId);
			return await tx.stamped.create({
				...this.getInclude(),
				data: {
					...dto,
					currentNum: dto.fromNum,
					fromDate: new Date(dto.fromDate),
					toDate: new Date(dto.toDate),
				},
			});
		});
		return StampedMapper.toDto(stamped);
	}

	async findAll(dto: StampedQueryDto) {
		const { baseWhere } = this.db.getBaseWhere(dto);
		const where = StampedFilter.getWhere(baseWhere, dto);
		const [data, count] = await Promise.all([
			this.db.stamped.findMany({
				where,
				...this.getInclude(),
				...this.db.paginate(dto),
			}),
			this.db.stamped.count({ where }),
		]);
		return this.db.getPagOutput({
			page: dto.page,
			size: dto.size,
			total: count,
			data: data.map((s) => StampedMapper.toDto(s)),
		});
	}

	async update(id: number, dto: CreateStampedDto) {
		this.validateDtoRanges(dto);
		const prevStamped = await this.db.stamped.findUnique({
			...this.getInclude(),
			where: { id, isActive: true },
		});

		if (!prevStamped) {
			throw new NotFoundException('El timbrado no existe o no esta activo');
		}

		if (prevStamped.currentNum > prevStamped.fromNum) {
			throw new BadRequestException(
				'No se puede editar un timbrado que ya esta en uso',
			);
		}

		const newStamped = await this.db.stamped.update({
			...this.getInclude(),
			data: {
				...dto,
				currentNum: dto.fromNum,
				fromDate: new Date(dto.fromDate),
				toDate: new Date(dto.toDate),
			},
			where: { id },
		});

		return StampedMapper.toDto(newStamped);
	}

	async findOne(id: number) {
		const stamped = await this.db.stamped.findUnique({
			...this.getInclude(),
			where: { id },
		});
		if (!stamped) throw new NotFoundException('El timbrado no existe');
		return StampedMapper.toDto(stamped);
	}

	async remove(id: number) {
		const isExists = await this.db.stamped.isExists({ id });
		if (!isExists) throw new NotFoundException('El timbrado no existe');
		return await this.db.stamped.softDelete({ id });
	}

	private async resetStampedsByStockId(
		tx: ExtendedTransaction,
		stockId: number,
	) {
		await tx.stamped.updateMany({
			where: { stockId, isActive: true },
			data: { isActive: false },
		});
	}

	private getInclude() {
		return {
			include: { stock: true },
		};
	}

	private validateDtoRanges(
		dto: Omit<CreateStampedDto, 'stampedNum' | 'stockId'>,
		currentNum?: number,
	) {
		const { fromDate, toDate, fromNum, toNum } = dto;

		if (!StampedValidationService.isValidDateRange(fromDate, toDate)) {
			throw new BadRequestException(
				'Las fechas deben ser posteriores a la fecha actual',
			);
		}

		if (!StampedValidationService.isFromBeforeTo(fromDate, toDate)) {
			throw new BadRequestException(
				'La fecha límite debe ser después de la fecha de inicio',
			);
		}

		if (!StampedValidationService.isNumRangeValid(fromNum, toNum)) {
			throw new BadRequestException(
				'El límite del número debe ser mayor al inicio',
			);
		}

		if (currentNum && currentNum >= toNum) {
			throw new BadRequestException('El timbrado ya no tiene numeros validos');
		}
	}
}
