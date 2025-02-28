import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { Prisma } from '@prisma/client';
import { PetQueryDto } from './dto/pet-query.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class PetService {
	constructor(private prisma: PrismaService) {}
	async create(createPetDto: CreatePetDto) {
		const speciesExists = await this.prisma.species.findUnique({
			where: { id: createPetDto.speciesId, deletedAt: null },
		});
		if (!speciesExists) {
			throw new NotFoundException(
				`Especie con ID ${createPetDto.speciesId} no existe o fue eliminada`,
			);
		}
		if (createPetDto.raceId) {
			const raceExists = await this.prisma.race.findUnique({
				where: { id: createPetDto.raceId, deletedAt: null },
			});
			if (!raceExists) {
				throw new NotFoundException(
					`Raza con ID ${createPetDto.raceId} no existe o fue eliminada`,
				);
			}
		}
		return this.prisma.pet.create({
			data: createPetDto,
		});
	}

	async findAll(dto: PetQueryDto) {
		const { baseWhere } = this.prisma.getBaseWhere(dto);

		let userId: number | undefined;
		if (dto.username) {
			const user = await this.prisma.user.findUnique({
				where: { username: dto.username },
			});
			if (!user) throw new NotFoundException(`Usuario "${dto.username}" no encontrado`);
			userId = user.id;
		}

		const where: Prisma.PetWhereInput = {
			...baseWhere,
			speciesId: dto.speciesId,
			raceId: dto.raceId,
			userId,
		};

		const [data, total] = await Promise.all([
			this.prisma.pet.findMany({
				...this.prisma.paginate(dto),
				where,
				include: { species: true, race: true },
			}),
			this.prisma.pet.count({ where }),
		]);

		return this.prisma.getPagOutput({
			page: dto.page,
			size: dto.size,
			total,
			data,
		});
	}

	async findOne(id: number) {
		const pet = await this.prisma.pet.findFirst({
			where: { id, deletedAt: null },
			include: {
				species: true,
				race: true,
			},
		});
		if (!pet) {
			throw new NotFoundException(`Mascota con id ${id} no encontrada`);
		}
		return pet;
	}

	async update(id: number, updatePetDto: UpdatePetDto) {
		try {
			const pet = await this.prisma.pet.update({
				where: { id, deletedAt: null },
				data: { ...updatePetDto, updatedAt: new Date() },
			});
			return pet;
		} catch (error) {
			if (
				error instanceof Prisma.PrismaClientKnownRequestError &&
				error.code === 'P2025'
			) {
				throw new NotFoundException(`Mascota con id ${id} no encontrada`);
			}
			throw new Error(
				`Error actualizando mascota con id ${id}: ${error.message}`,
			);
		}
	}

	async remove(id: number) {
		const pet = await this.prisma.pet.findFirst({
			where: { id, deletedAt: null },
		});
		if (!pet) {
			throw new NotFoundException(
				`Mascota con id ${id} no encontrada o ya eliminada`,
			);
		}
		return this.prisma.pet.update({
			where: { id },
			data: { deletedAt: new Date() },
		});
	}
}
