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
		const prevStamped = await this.db.stamped.findFirst({ where: { id } });
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

	private validateDtoRanges(dto: CreateStampedDto) {
		this.isDateRangeValid(dto.fromDate, dto.toDate);
		this.isNumRangeValid(dto.fromNum, dto.toNum);
	}

	private isDateRangeValid(from: string, to: string) {
		const today = normalizeDate(getToday());

		if (today > from || today > to) {
			throw new BadRequestException(
				'Las fechas deben ser posteriores a la actual',
			);
		}

		if (from >= to) {
			throw new BadRequestException(
				'La fecha limite debe ser después de la fecha de inicio',
			);
		}
	}

	private isNumRangeValid(from: number, to: number) {
		if (from >= to) {
			throw new BadRequestException(
				'El limite del número debe ser mayor al inicio',
			);
		}
		return true;
	}
}
