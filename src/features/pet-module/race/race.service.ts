import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRaceDto } from './dto/create-race.dto';
import { UpdateRaceDto } from './dto/update-race.dto';
import { Prisma } from '@prisma/client';
import { RaceQueryDto } from './dto/race-query.dto';
import { PrismaService } from '@features/prisma/prisma.service';

@Injectable()
export class RaceService {
	constructor(private prisma: PrismaService) {}

	async create(dto: CreateRaceDto) {
		const speciesExists = await this.prisma.species.isExists({
			id: dto.speciesId,
		});
		if (!speciesExists) throw new NotFoundException('Especie no encontrada');
		return this.prisma.race.create({
			data: dto,
		});
	}

	async findAll(dto: RaceQueryDto) {
		const { baseWhere } = this.prisma.getBaseWhere(dto);
		const where: Prisma.RaceWhereInput = {
			...baseWhere,
			speciesId: dto.speciesId,
			name: { contains: dto.name, mode: 'insensitive' },
		};

		const [data, total] = await Promise.all([
			this.prisma.race.findMany({
				...this.prisma.paginate(dto),
				where,
				include: { species: true },
			}),
			this.prisma.race.count({ where }),
		]);

		return this.prisma.getPagOutput({
			page: dto.page,
			size: dto.size,
			total,
			data,
		});
	}

	async findOne(id: number) {
		const race = await this.prisma.race.findUnique({
			where: { id },
			include: {
				species: true,
				pets: true,
			},
		});
		if (!race) throw new NotFoundException(`Raza no encontrada`);
		return race;
	}

	async update(id: number, updateRaceDto: UpdateRaceDto) {
		try {
			const race = await this.prisma.race.update({
				where: { id, deletedAt: null },
				data: updateRaceDto,
			});
			return race;
		} catch (error) {
			if (
				error instanceof Prisma.PrismaClientKnownRequestError &&
				error.code === 'P2025'
			) {
				throw new NotFoundException(`Raza con id ${id} no encontrada`);
			}
			throw new Error(`Error actualizando raza con id ${id}: ${error.message}`);
		}
	}

	async remove(id: number) {
		const race = await this.prisma.race.isExists({ id });
		if (!race) throw new NotFoundException('Raza no encontrada');
		return this.prisma.race.update({
			where: { id },
			data: { deletedAt: new Date() },
		});
	}
}
