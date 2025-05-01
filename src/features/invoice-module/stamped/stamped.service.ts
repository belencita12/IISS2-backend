import { PrismaService } from '@features/prisma/prisma.service';
import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { CreateStampedDto } from './dto/create-stamped.dto';
import { getToday, normalizeDate } from '@lib/utils/date';
import { StampedDto } from './dto/stamped.dto';
import { StampedQueryDto } from './dto/stamped-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class StampedService {
	constructor(private readonly db: PrismaService) {}

	async create(dto: CreateStampedDto) {
		this.validateDtoRanges(dto);
		const stamped = await this.db.stamped.create({
			data: {
				...dto,
				currentNum: dto.fromNum,
				fromDate: new Date(dto.fromDate),
				toDate: new Date(dto.toDate),
			},
		});
		return new StampedDto(stamped);
	}

	async findAll(dto: StampedQueryDto) {
		const where = this.getWhere(dto);
		const [data, count] = await Promise.all([
			this.db.stamped.findMany({ where, ...this.db.paginate(dto) }),
			this.db.stamped.count({ where }),
		]);
		return this.db.getPagOutput({
			page: dto.page,
			size: dto.size,
			total: count,
			data: data.map((s) => new StampedDto(s)),
		});
	}

	async update(id: number, dto: CreateStampedDto) {
		this.validateDtoRanges(dto);
		const prevStamped = await this.db.stamped.findUnique({ where: { id } });
		if (!prevStamped) throw new NotFoundException('El timbrado no existe');
		if (prevStamped.currentNum > prevStamped.fromNum) {
			throw new BadRequestException(
				'No se puede editar un timbrado que ya esta en uso',
			);
		}
		const newStamped = await this.db.stamped.update({
			data: {
				...dto,
				currentNum: dto.fromNum,
				fromDate: new Date(dto.fromDate),
				toDate: new Date(dto.toDate),
			},
			where: { id },
		});
		return new StampedDto(newStamped);
	}

	async findOne(id: number) {
		const stamped = await this.db.stamped.findUnique({ where: { id } });
		if (!stamped) throw new NotFoundException('El timbrado no existe');
		return new StampedDto(stamped);
	}

	async remove(id: number) {
		const isExists = await this.db.stamped.isExists({ id });
		if (!isExists) throw new NotFoundException('El timbrado no existe');
		return await this.db.stamped.softDelete({ id });
	}

	async isStampedUsable(id: number) {
		const stamped = await this.db.stamped.findUnique({
			where: { id },
			include: { stock: true },
		});
		if (!stamped) throw new NotFoundException('El timbrado no existe');
		if (stamped.stock !== null)
			throw new BadRequestException(
				'El timbrado ya esta en uso por otro deposito',
			);
		const { fromDate, toDate, fromNum, toNum } = stamped;
		this.validateDtoRanges({
			fromDate: normalizeDate(fromDate),
			toDate: normalizeDate(toDate),
			fromNum,
			toNum,
		});
		return true;
	}

	private getWhere(query: StampedQueryDto) {
		const { baseWhere } = this.db.getBaseWhere(query);
		const where: Prisma.StampedWhereInput = { ...baseWhere };

		if (query.stamped) {
			where.stampedNum = { contains: query.stamped, mode: 'insensitive' };
		}

		if (query.fromDate) {
			where.fromDate = { gte: new Date(query.fromDate) };
		}

		if (query.toDate) {
			const toDate = new Date(query.toDate);
			toDate.setDate(toDate.getDate() + 1);
			where.toDate = { lte: toDate };
		}

		return where;
	}

	private validateDtoRanges(dto: Omit<CreateStampedDto, 'stampedNum'>) {
		const { fromDate, toDate, fromNum, toNum } = dto;

		if (!this.isFromAndToAfterToday(fromDate, toDate)) {
			throw new BadRequestException(
				'Las fechas deben ser posteriores a la fecha actual',
			);
		}

		if (!this.isFromBeforeTo(fromDate, toDate)) {
			throw new BadRequestException(
				'La fecha límite debe ser después de la fecha de inicio',
			);
		}

		if (!this.isNumRangeValid(fromNum, toNum)) {
			throw new BadRequestException(
				'El límite del número debe ser mayor al inicio',
			);
		}
	}

	private isFromAndToAfterToday(from: string, to: string): boolean {
		const today = normalizeDate(getToday());
		return today < from && today < to;
	}

	private isFromBeforeTo(from: string, to: string): boolean {
		return from < to;
	}

	private isNumRangeValid(from: number, to: number): boolean {
		return from < to;
	}
}
