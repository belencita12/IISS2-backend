import { HttpException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { Prisma, Role, User } from '@prisma/client';
import { genUsername, hash } from '@/lib/utils/encrypt';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class UserService {
	constructor(private readonly db: PrismaService) {}

	async create(dto: CreateUserDto) {
		const username = genUsername(dto.fullName);
		const roles = dto.roles || ['USER'];
		const hashPsw = await hash(dto.password);
		const user = await this.db.user.create({
			data: {
				...dto,
				password: hashPsw,
				username,
				roles: {
					connectOrCreate: roles?.map((role) => ({
						where: { name: role },
						create: { name: role },
					})),
				},
			},
			include: { roles: true },
		});
		return this.toDto(user);
	}

	async findByEmail(email: string) {
		const user = await this.db.user.findUnique({
			where: { email },
			include: { roles: true },
		});
		return user;
	}

	async findAll(dto: UserQueryDto) {
		const { baseWhere } = this.db.getBaseWhere(dto);

		const where: Prisma.UserWhereInput = {
			...baseWhere,
			...this.getWhereByQuerySearch(dto.query),
			roles: dto.role ? { some: { name: dto.role } } : undefined,
			pets: dto.speciesId
				? { some: { speciesId: dto.speciesId, raceId: dto.raceId } }
				: undefined,
		};

		const [users, total] = await Promise.all([
			this.db.user.findMany({
				...this.db.paginate(dto),
				where,
				include: { roles: true },
			}),
			this.db.user.count({ where }),
		]);

		return this.db.getPagOutput({
			page: dto.page,
			size: dto.size,
			total,
			data: users.map((user) => this.toDto(user)),
		});
	}

	async findOne(id: number) {
		const user = await this.db.user.findUnique({
			where: { id },
			include: { roles: true },
		});
		if (!user) throw new HttpException('User not found', 404);
		return this.toDto(user);
	}

	async update(id: number, updateDto: UpdateUserDto) {
		const { roles: newRoles, password, ...dto } = updateDto;
		const user = await this.db.user.update({
			where: { id },
			include: { roles: true },
			data: {
				...dto,
				username: dto.fullName ? genUsername(dto.fullName) : undefined,
				password: password ? await hash(password) : undefined,
				roles: newRoles
					? { set: newRoles.map((role) => ({ name: role })) }
					: undefined,
			},
		});
		return this.toDto(user);
	}
	async remove(id: number) {
		const isExists = await this.db.user.isExists({ id });
		if (!isExists) throw new HttpException('User not found', 404);
		await this.db.user.softDelete({ id });
	}

	private toDto(user: User & { roles: Role[] }) {
		return {
			...user,
			roles: user.roles.map((role) => role.name),
		};
	}

	private getWhereByQuerySearch(query?: string) {
		let querySearchWhere: Prisma.UserWhereInput = {};
		if (!query) return querySearchWhere;
		const searchQuery = query.trim();
		if (searchQuery.includes('@'))
			querySearchWhere = {
				email: { contains: searchQuery, mode: 'insensitive' },
			};
		else
			querySearchWhere = {
				fullName: { contains: searchQuery, mode: 'insensitive' },
			};
		return querySearchWhere;
	}
}
