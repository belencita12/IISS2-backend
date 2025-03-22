import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PrismaService } from '@features/prisma/prisma.service';
import { genUsername, hash } from '@lib/utils/encrypt';
import { Prisma } from '@prisma/client';
import { ClientDto } from './dto/client.dto';
import { ClientQueryDto } from './dto/client-query.dto';
import { onlyNumbers } from '@lib/utils/reg-exp';
import { ImageService } from '@features/media-module/image/image.service';
import { ClientEntity } from './entity/client.entity';

@Injectable()
export class ClientService {
	constructor(
		private readonly db: PrismaService,
		private readonly img: ImageService,
	) {}

	async create(dto: CreateClientDto) {
		const { roles, ...data } = dto;
		const username = genUsername(data.fullName);
		const password = await hash(data.password);
		const client = await this.db.client.create({
			include: { user: { include: { roles: true, image: true } } },
			data: {
				user: {
					create: {
						...data,
						username,
						password,
						roles: {
							connectOrCreate: roles.map((role) => ({
								where: { name: role },
								create: { name: role },
							})),
						},
					},
				},
			},
		});
		return this.toDto(client);
	}

	async findAll(dto: ClientQueryDto) {
		return await this.filter(dto);
	}

	async findOne(id: number) {
		const client = await this.db.client.findUnique({
			where: { id },
			include: { user: { include: { roles: true, image: true } } },
		});
		if (!client) throw new NotFoundException('Cliente no encontrado');
		return this.toDto(client);
	}

	async update(id: number, dto: UpdateClientDto) {
		const client = await this.db.client.findUnique({
			where: { id },
			select: { user: { select: { image: true, fullName: true } } },
		});
		if (!client) throw new NotFoundException('Cliente no encontrado');
		const newImg = await this.img.upsert(client.user.image, dto.profileImg);
		const newUsername =
			dto.fullName && dto.fullName !== client.user.fullName
				? genUsername(dto.fullName)
				: undefined;
		const newClient = await this.db.client.update({
			where: { id },
			include: { user: { include: { roles: true, image: true } } },
			data: {
				user: {
					update: {
						data: {
							...dto,
							username: newUsername,
							image: newImg?.id ? { connect: { id: newImg.id } } : undefined,
						},
					},
				},
			},
		});
		return this.toDto(newClient);
	}

	async remove(id: number) {
		const client = await this.db.client.isExists({ id });
		if (!client) throw new NotFoundException('Cliente no encontrado');
		await this.db.user.softDelete({ id });
		await this.db.client.softDelete({ id });
	}

	private async filter(dto: ClientQueryDto) {
		const { baseWhere } = this.db.getBaseWhere(dto);

		const petFilter: Prisma.PetListRelationFilter | undefined =
			dto.petRaceId || dto.petSpeciesId
				? {
						some: {
							raceId: dto.petRaceId,
							speciesId: dto.petSpeciesId,
						},
					}
				: undefined;

		const where: Prisma.ClientWhereInput = {
			...baseWhere,
			...this.filterQueryString(dto.query),
			pets: petFilter,
		};

		const [data, total] = await Promise.all([
			this.db.client.findMany({
				...this.db.paginate(dto),
				where,
				include: { user: { include: { roles: true, image: true } } },
			}),
			this.db.client.count({ where }),
		]);
		return this.db.getPagOutput({
			page: dto.page,
			size: dto.size,
			total,
			data: data.map((client) => this.toDto(client)),
		});
	}

	private filterQueryString(str?: string) {
		const querySearchWhere: Prisma.ClientWhereInput = {};
		if (!str) return querySearchWhere;
		const searchQuery = str.trim();
		if (searchQuery.includes('@')) {
			querySearchWhere.user = {
				email: { contains: searchQuery, mode: 'insensitive' },
			};
		} else if (onlyNumbers.test(searchQuery)) {
			querySearchWhere.user = {
				ruc: { contains: searchQuery, mode: 'insensitive' },
			};
		} else {
			querySearchWhere.user = {
				fullName: { contains: searchQuery, mode: 'insensitive' },
			};
		}
		return querySearchWhere;
	}

	private toDto(client: ClientEntity): ClientDto {
		const clientDto = new ClientDto();
		clientDto.id = client.id;
		clientDto.phoneNumber = client.user.phoneNumber;
		clientDto.adress = client.user.adress || undefined;
		clientDto.username = client.user.username;
		clientDto.email = client.user.email;
		clientDto.fullName = client.user.fullName;
		clientDto.ruc = client.user.ruc;
		clientDto.roles = client.user.roles.map((role) => role.name);
		clientDto.image = client.user.image
			? {
					id: client.user.image.id,
					originalUrl: client.user.image.originalUrl,
					previewUrl: client.user.image.previewUrl,
				}
			: undefined;
		clientDto.createdAt = client.createdAt;
		clientDto.updatedAt = client.updatedAt;
		clientDto.deletedAt = client.deletedAt;
		return clientDto;
	}
}
