import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePetDto } from './dto/create-pet.dto';
import { Prisma } from '@prisma/client';
import { PetQueryDto } from './dto/pet-query.dto';
import { PetDto } from './dto/pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { TokenPayload } from '@features/auth-module/auth/types/auth.types';
import { ImageService } from '@features/media-module/image/image.service';
import { PrismaService } from '@features/prisma/prisma.service';
import { Role } from '@lib/constants/role.enum';

@Injectable()
export class PetService {
	constructor(
		private prisma: PrismaService,
		private readonly imgService: ImageService,
	) {}
	async create(createPetDto: CreatePetDto) {
		const {
			speciesId,
			raceId,
			profileImg,
			clientId: userId,
			...dto
		} = createPetDto;
		const imgData = profileImg
			? await this.imgService.create(profileImg)
			: undefined;
		const pet = await this.prisma.pet.create({
			include: { species: true, race: true, profileImg: true },
			data: {
				...dto,
				client: { connect: { id: userId } },
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
			clientId: dto.clientId,
			name: { contains: dto.name, mode: 'insensitive' },
		};

		const [data, total] = await Promise.all([
			this.prisma.pet.findMany({
				...this.prisma.paginate(dto),
				where,
				include: {
					species: true,
					race: true,
					profileImg: true,
					vaccines: { include: { vaccine: true } },
				},
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
		const { roles, clientId } = user;
		const pet = await this.prisma.pet.findUnique({
			where: { id, clientId: roles.includes(Role.User) ? clientId : undefined },
			include: { species: true, race: true, profileImg: true },
		});
		if (!pet) throw new NotFoundException(`Mascota no encontrada`);
		return new PetDto(pet);
	}

	async update(id: number, dto: UpdatePetDto) {
		const pet = await this.prisma.pet.findFirst({
			where: { id },
			select: { profileImg: true },
		});
		if (!pet) throw new NotFoundException(`Mascota no encontrada`);

		const { profileImg, raceId, clientId: clientId, speciesId, ...rest } = dto;
		const newImg = await this.imgService.upsert(pet.profileImg, profileImg);
		const newPet = await this.prisma.pet.update({
			where: { id, deletedAt: null },
			include: { profileImg: true, species: true, race: true },
			data: {
				...rest,
				client: clientId ? { connect: { id: clientId } } : undefined,
				species: speciesId ? { connect: { id: speciesId } } : undefined,
				race: raceId ? { connect: { id: raceId } } : undefined,
				profileImg: newImg ? { connect: { id: newImg.id } } : undefined,
			},
		});
		return new PetDto(newPet);
	}

	async remove(id: number) {
		const pet = await this.prisma.pet.isExists({ id });
		if (!pet) throw new NotFoundException(`Mascota no encontrada`);
		await this.prisma.pet.softDelete({ id });
	}
}
