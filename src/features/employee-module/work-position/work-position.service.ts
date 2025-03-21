import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateWorkPositionDto } from './dto/work-position/create-work-position.dto';
import { WorkPositionDto } from './dto/work-position/work-position.dto';
import { UpdateWorkPositionDto } from './dto/work-position/update-work-position.dto';
import { WorkPositionQueryDto } from './dto/work-position/work-position-query.dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@features/prisma/prisma.service';

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
		if (!work) throw new NotFoundException('Puesto de trabajo no encontrado');
		return new WorkPositionDto(work);
	}

	async update(id: number, dto: UpdateWorkPositionDto) {
		const exists = await this.db.workPosition.isExists({ id });
		if (!exists) throw new NotFoundException('Puesto de trabajo no encontrado');
		const prevShifts = await this.db.workShift.findMany({
			where: { workPositionId: id },
		});
		const { name, shifts } = dto;
		await this.db.$transaction(async (tx) => {
			for (const prevShift of prevShifts) {
				if (!shifts.some((s) => s.id === prevShift.id))
					await tx.workShift.delete({ where: { id: prevShift.id } });
			}
			for (const shift of shifts) {
				if (!shift.id)
					await tx.workShift.create({ data: { ...shift, workPositionId: id } });
				else
					await tx.workShift.update({ where: { id: shift.id }, data: shift });
			}
			await this.db.workPosition.update({
				where: { id },
				data: { name },
			});
		});
		const work = await this.db.workPosition.findUnique({
			where: { id },
			include: { shifts: true },
		});
		return new WorkPositionDto(work!);
	}

	async remove(id: number) {
		const exists = await this.db.workPosition.isExists({ id });
		if (!exists) throw new NotFoundException('Puesto de trabajo no encontrado');
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
