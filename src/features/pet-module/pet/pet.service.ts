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
		private readonly db: PrismaService,
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
		const pet = await this.db.pet.create({
			...this.getInclude(),
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
		const { baseWhere } = this.db.getBaseWhere(dto);
		const where: Prisma.PetWhereInput = {
			...baseWhere,
			speciesId: dto.speciesId,
			raceId: dto.raceId,
			clientId: dto.clientId,
			name: { contains: dto.name, mode: 'insensitive' },
		};

		const [data, total] = await Promise.all([
			this.db.pet.findMany({
				...this.getInclude(),
				...this.db.paginate(dto),
				where,
			}),
			this.db.pet.count({ where }),
		]);

		return this.db.getPagOutput({
			page: dto.page,
			size: dto.size,
			total,
			data: data.map((pet) => new PetDto(pet)),
		});
	}

	async findOne(id: number, user: TokenPayload) {
		const { roles, clientId } = user;
		const pet = await this.db.pet.findUnique({
			where: { id, clientId: roles.includes(Role.User) ? clientId : undefined },
			...this.getInclude(),
		});
		if (!pet) throw new NotFoundException(`Mascota no encontrada`);
		return new PetDto(pet);
	}

	async update(id: number, dto: UpdatePetDto) {
		const pet = await this.db.pet.findFirst({
			where: { id },
			select: { profileImg: true },
		});
		if (!pet) throw new NotFoundException(`Mascota no encontrada`);

		const { profileImg, raceId, clientId: clientId, speciesId, ...rest } = dto;
		const newImg = await this.imgService.upsert(pet.profileImg, profileImg);
		const newPet = await this.db.pet.update({
			...this.getInclude(),
			where: { id, deletedAt: null },
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
		const pet = await this.db.pet.isExists({ id });
		if (!pet) throw new NotFoundException(`Mascota no encontrada`);
		await this.db.pet.softDelete({ id });
	}

	private getInclude() {
		return {
			include: {
				profileImg: true,
				client: { include: { user: true } },
				species: true,
				race: true,
			},
		};
	}
}
