import { HttpException, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { PrismaService } from '@/prisma.service';
import { RoleQueryDto } from './dto/role-query.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class RoleService {
	constructor(private readonly db: PrismaService) {}

	async create(dto: CreateRoleDto) {
		const role = await this.db.role.create({ data: dto });
		return role;
	}

	async findAll(dto: RoleQueryDto) {
		const { pagination, baseWhere, orderBy } = this.db.getBaseQuery(dto);
		const where: Prisma.RoleWhereInput = {
			...baseWhere,
			name: { contains: dto.name },
		};
		const [data, total] = await this.db.$transaction([
			this.db.role.findMany({ ...pagination, orderBy, where }),
			this.db.role.count({ where }),
		]);
		return this.db.getPaginatedResponse(pagination, total, data);
	}

	async findOne(id: number) {
		const role = await this.db.role.findUnique({ where: { id } });
		if (!role) throw new HttpException('Role not found', 404);
		return role;
	}

	async update(id: number, updateDto: UpdateRoleDto) {
		const role = await this.db.role.update({ where: { id }, data: updateDto });
		return role;
	}

	async remove(id: number) {
		const role = await this.db.role.update({
			where: { id },
			data: { deletedAt: new Date() },
		});
		return role;
	}
}
