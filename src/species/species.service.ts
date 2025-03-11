import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSpeciesDto } from './dto/create-species.dto';
import { UpdateSpeciesDto } from './dto/update-species.dto';
import { Prisma } from '@prisma/client';
import { SpeciesQueryDto } from './dto/species-query.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class SpeciesService {
	constructor(private prisma: PrismaService) {}

	async create(createSpeciesDto: CreateSpeciesDto) {
		return this.prisma.species.create({
			data: createSpeciesDto,
		});
	}

	async findAll(dto: SpeciesQueryDto) {
		const { baseWhere } = this.prisma.getBaseWhere(dto);

		const where: Prisma.SpeciesWhereInput = {
			...baseWhere,
			name: { contains: dto.name, mode: 'insensitive' },
		};

		const [data, total] = await Promise.all([
			this.prisma.species.findMany({
				...this.prisma.paginate(dto),
			}),
			this.prisma.species.count({ where }),
		]);

		return this.prisma.getPagOutput({
			page: dto.page,
			size: dto.size,
			total,
			data,
		});
	}

	async findOne(id: number) {
		const species = await this.prisma.species.findUnique({
			where: { id, deletedAt: null },
			include: {
				races: true,
				pets: true,
			},
		});
		if (!species) {
			throw new NotFoundException(`Especie con id ${id} no encontrada`);
		}
		return species;
	}

	async update(id: number, updateSpeciesDto: UpdateSpeciesDto) {
		try {
			const species = await this.prisma.species.update({
				where: { id, deletedAt: null },
				data: updateSpeciesDto,
			});
			return species;
		} catch (error) {
			if (
				error instanceof Prisma.PrismaClientKnownRequestError &&
				error.code === 'P2025'
			) {
				throw new NotFoundException(`Especie con id ${id} no encontrada`);
			}
			throw new Error(
				`Error actualizando especie con id ${id}: ${error.message}`,
			);
		}
	}

	async remove(id: number) {
		const species = await this.prisma.species.findFirst({
			where: { id, deletedAt: null },
		});
		if (!species) {
			throw new NotFoundException(
				`Especie con id ${id} no encontrada o ya eliminada`,
			);
		}
		return this.prisma.species.update({
			where: { id },
			data: { deletedAt: new Date() },
		});
	}
}
