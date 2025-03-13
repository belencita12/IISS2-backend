import { HttpException, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { RoleQueryDto } from './dto/role-query.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class RoleService {
	constructor(private readonly db: PrismaService) {}

	async create(dto: CreateRoleDto) {
		const role = await this.db.role.create({ data: dto });
		return role;
	}

	async findAll(dto: RoleQueryDto) {
		const { baseWhere } = this.db.getBaseWhere(dto);
		const where: Prisma.RoleWhereInput = {
			...baseWhere,
			name: { contains: dto.name, mode: 'insensitive' },
		};
		const [data, total] = await Promise.all([
			this.db.role.findMany({ ...this.db.paginate(dto), where }),
			this.db.role.count({ where }),
		]);
		return this.db.getPagOutput({
			page: dto.page,
			size: dto.size,
			total,
			data,
		});
	}

	async findOne(id: number) {
		const role = await this.db.role.findUnique({ where: { id } });
		if (!role) throw new HttpException('Role not found', 404);
		return role;
	}

	async update(id: number, updateDto: UpdateRoleDto) {
		const exists = await this.db.role.isExists({ id });
		if (!exists) throw new HttpException('Role not found', 404);
		const role = await this.db.role.update({ where: { id }, data: updateDto });
		return role;
	}

	async remove(id: number) {
		const exists = await this.db.role.isExists({ id });
		if (!exists) throw new HttpException('Role not found', 404);
		await this.db.role.softDelete({ id });
	}
}
