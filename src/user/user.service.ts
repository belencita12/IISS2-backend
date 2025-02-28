import { HttpException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { Prisma, Role, User } from '@prisma/client';
import { hash } from '@/lib/utils/encrypt';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class UserService {
	constructor(private readonly db: PrismaService) {}

	async create(dto: CreateUserDto) {
		const roles = dto.roles || ['USER'];
		const hashPsw = await hash(dto.password);
		const user = await this.db.user.create({
			data: {
				...dto,
				password: hashPsw,
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
		const { email } = dto;
		const { baseWhere } = this.db.getBaseWhere(dto);

		const where: Prisma.UserWhereInput = {
			...baseWhere,
			email: { contains: email },
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
				password: password ? await hash(password) : undefined,
				roles: newRoles
					? { set: newRoles.map((role) => ({ name: role })) }
					: undefined,
			},
		});
		return this.toDto(user);
	}
	async remove(id: number) {
		const user = await this.db.user.update({
			where: { id },
			include: { roles: true },
			data: { deletedAt: new Date() },
		});
		return this.toDto(user);
	}

	private toDto(user: User & { roles: Role[] }) {
		return {
			...user,
			roles: user.roles.map((role) => role.name),
		};
	}
}
