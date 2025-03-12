import { HttpException, Injectable } from '@nestjs/common';
import { CreateWorkPositionDto } from './dto/work-position/create-work-position.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { WorkPositionDto } from './dto/work-position/work-position.dto';
import { UpdateWorkPositionDto } from './dto/work-position/update-work-position.dto';
import { WorkPositionQueryDto } from './dto/work-position/work-position-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class WorkPositionService {
	constructor(private readonly prisma: PrismaService) {}

	async create(dto: CreateWorkPositionDto) {
		const { name, shifts } = dto;
		const work = await this.prisma.workPosition.create({
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
		const work = await this.prisma.workPosition.findUnique({
			where: { id },
			include: { shifts: true },
		});
		if (!work) throw new HttpException('Puesto de trabajo no encontrado', 404);
		return new WorkPositionDto(work);
	}

	async update(id: number, dto: UpdateWorkPositionDto) {
		const { name, shifts } = dto;
		const work = await this.prisma.workPosition.update({
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
		const work = await this.prisma.workPosition.update({
			where: { id },
			data: { deletedAt: new Date() },
			include: { shifts: true },
		});
		return new WorkPositionDto(work);
	}

	private async filter(query: WorkPositionQueryDto) {
		const { baseWhere } = this.prisma.getBaseWhere(query);
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
			this.prisma.workPosition.findMany({
				...this.prisma.paginate(query),
				where,
			}),
			this.prisma.workPosition.count({ where }),
		]);
		return this.prisma.getPagOutput({
			page: query.page,
			size: query.size,
			total,
			data,
		});
	}
}
