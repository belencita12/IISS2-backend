import { HttpException, Injectable } from '@nestjs/common';
import { CreateWorkPositionDto } from './dto/work-position/create-work-position.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { WorkPositionDto } from './dto/work-position/work-position.dto';
import { UpdateWorkPositionDto } from './dto/work-position/update-work-position.dto';
import { WorkPositionQueryDto } from './dto/work-position/work-position-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class WorkPositionService {
	constructor(private readonly db: PrismaService) {}

	async create(dto: CreateWorkPositionDto) {
		const { name, shifts } = dto;
		const work = await this.db.workPosition.create({
			include: { shifts: true },
			data: {
				name,
				shifts: {
					createMany: {
						data: shifts,
					},
				},
			},
		});
		return new WorkPositionDto(work);
	}

	async findAll(query: WorkPositionQueryDto) {
		return await this.filter(query);
	}

	async findOne(id: number) {
		const work = await this.db.workPosition.findUnique({
			where: { id },
			include: { shifts: true },
		});
		if (!work) throw new HttpException('Puesto de trabajo no encontrado', 404);
		return new WorkPositionDto(work);
	}

	async update(id: number, dto: UpdateWorkPositionDto) {
		const exists = await this.db.workPosition.isExists({ id });
		if (!exists)
			throw new HttpException('Puesto de trabajo no encontrado', 404);
		const { name, shifts } = dto;
		const work = await this.db.workPosition.update({
			include: { shifts: true },
			where: { id },
			data: {
				name,
				shifts: {
					...(shifts && shifts.length > 0
						? { deleteMany: {}, createMany: { data: shifts } }
						: {}),
				},
			},
		});
		return new WorkPositionDto(work);
	}

	async remove(id: number) {
		const exists = await this.db.workPosition.isExists({ id });
		if (!exists)
			throw new HttpException('Puesto de trabajo no encontrado', 404);
		await this.db.workPosition.softDelete({ id });
	}

	private async filter(query: WorkPositionQueryDto) {
		const { baseWhere } = this.db.getBaseWhere(query);
		const where: Prisma.WorkPositionWhereInput = {
			...baseWhere,
			name: { contains: query.name, mode: 'insensitive' },
			shifts: {
				some: {
					startTime: { gte: query.startTimeFrom, lte: query.startTimeTo },
					endTime: { gte: query.endTimeFrom, lte: query.endTimeTo },
					weekDay: query.weekDay,
				},
			},
		};
		const [data, total] = await Promise.all([
			this.db.workPosition.findMany({
				...this.db.paginate(query),
				where,
			}),
			this.db.workPosition.count({ where }),
		]);
		return this.db.getPagOutput({
			page: query.page,
			size: query.size,
			total,
			data,
		});
	}
}
