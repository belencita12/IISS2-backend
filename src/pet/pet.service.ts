import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { Prisma } from '@prisma/client';
import { PetQueryDto } from './dto/pet-query.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { TokenPayload } from '@/auth/types/auth.types';
import { Role } from '@/lib/constants/role.enum';
import { ImageService } from '@/image/image.service';
import { PetDto } from './dto/pet.dto';

@Injectable()
export class PetService {
	constructor(
		private prisma: PrismaService,
		private readonly imgService: ImageService,
	) {}
	async create(createPetDto: CreatePetDto) {
		const { speciesId, raceId, profileImg, userId, ...dto } = createPetDto;
		const imgData = profileImg
			? await this.imgService.create(profileImg)
			: undefined;
		const pet = await this.prisma.pet.create({
			include: {
				species: { select: { name: true } },
				race: { select: { name: true } },
				profileImg: {
					select: { id: true, previewUrl: true, originalUrl: true },
				},
			},
			data: {
				...dto,
				user: { connect: { id: userId } },
				species: { connect: { id: speciesId } },
				race: { connect: { id: raceId } },
				profileImg: imgData ? { connect: { id: imgData.id } } : undefined,
			},
		});
		return new PetDto(pet);
	}

	async findAll(dto: PetQueryDto) {
		const { baseWhere } = this.prisma.getBaseWhere(dto);
		const where: Prisma.PetWhereInput = {
			...baseWhere,
			speciesId: dto.speciesId,
			raceId: dto.raceId,
			userId: dto.userId,
		};

		const [data, total] = await Promise.all([
			this.prisma.pet.findMany({
				...this.prisma.paginate(dto),
				where,
				include: { species: true, race: true, profileImg: true },
			}),
			this.prisma.pet.count({ where }),
		]);

		return this.prisma.getPagOutput({
			page: dto.page,
			size: dto.size,
			total,
			data: data.map((pet) => new PetDto(pet)),
		});
	}

	async findOne(id: number, user: TokenPayload) {
		const { roles, id: userId } = user;
		const pet = await this.prisma.pet.findUnique({
			where: {
				id,
				deletedAt: null,
				userId: roles.includes(Role.User) ? userId : undefined,
			},
			include: {
				species: { select: { name: true } },
				race: { select: { name: true } },
				profileImg: {
					select: { id: true, previewUrl: true, originalUrl: true },
				},
			},
		});
		if (!pet) throw new NotFoundException(`Mascota con id ${id} no encontrada`);
		return pet;
	}

	async update(id: number, dto: UpdatePetDto) {
		const petToUpd = await this.prisma.pet.findUnique({
			where: { id },
			select: { profileImg: true },
		});
		if (!petToUpd)
			throw new NotFoundException(`Mascota con id ${id} no encontrada`);

		const { profileImg, raceId, userId, speciesId, ...rest } = dto;
		const newImg =
			profileImg && petToUpd.profileImg !== null
				? await this.imgService.update(petToUpd.profileImg.id, profileImg)
				: profileImg && !petToUpd.profileImg
					? await this.imgService.create(profileImg)
					: undefined;

		const pet = await this.prisma.pet.update({
			where: { id, deletedAt: null },
			include: {
				species: { select: { name: true } },
				race: { select: { name: true } },
				profileImg: {
					select: { id: true, previewUrl: true, originalUrl: true },
				},
			},
			data: {
				...rest,
				species: speciesId ? { connect: { id: speciesId } } : undefined,
				user: userId ? { connect: { id: userId } } : undefined,
				race: raceId ? { connect: { id: raceId } } : undefined,
				profileImg: newImg ? { connect: { id: newImg.id } } : undefined,
				updatedAt: new Date(),
			},
		});
		return new PetDto(pet);
	}

	async remove(id: number) {
		return await this.prisma.pet.update({
			where: { id },
			data: { deletedAt: new Date() },
		});
	}
}
