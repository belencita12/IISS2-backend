import { HttpException, Injectable } from '@nestjs/common';
import { CreateWorkPositionDto } from './dto/create-work-position.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { WorkPositionDto } from './dto/work-position.dto';
import { UpdateWorkPositionDto } from './dto/update-work-position.dto';

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

	findAll() {}

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
					...(shifts && shifts.length > 0 ? { set: shifts } : {}),
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
}
