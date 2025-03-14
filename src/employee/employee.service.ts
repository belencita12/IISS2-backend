import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmplyeeDto } from './dto/update-employee.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { ImageService } from '@/image/image.service';
import { genPassword, genUsername } from '@/lib/utils/encrypt';
import { EmployeeDto } from './dto/employee.dto';
import { AuthService } from '@/auth/auth.service';
import { EmployeeQueryDto } from './dto/employee.query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class EmployeeService {
	constructor(
		private readonly db: PrismaService,
		private readonly imgService: ImageService,
		private readonly authService: AuthService,
	) {}

	async create(dto: CreateEmployeeDto) {
		const { profileImg, ruc, positionId, email, fullName, ...data } = dto;

		const isPosExists = await this.db.workPosition.isExists({
			id: positionId,
		});
		if (!isPosExists)
			throw new NotFoundException('Posicion de trabajo no encontrada');

		const password = await genPassword();
		const username = genUsername(fullName);

		const img = profileImg ? await this.imgService.create(profileImg) : null;

		const employee = await this.db.employee.create({
			include: {
				position: true,
				user: {
					select: {
						email: true,
						fullName: true,
						username: true,
						roles: true,
						image: true,
					},
				},
			},
			data: {
				...data,
				ruc,
				position: { connect: { id: positionId } },
				user: {
					create: {
						username,
						email,
						password,
						fullName,
						imageId: img?.id ?? null,
						roles: {
							connectOrCreate: {
								where: { name: 'EMPLOYEE' },
								create: { name: 'EMPLOYEE' },
							},
						},
					},
				},
			},
		});
		this.authService.getResetPassToken(employee.user.email);
		return new EmployeeDto(employee);
	}

	async findAll(query: EmployeeQueryDto) {
		return await this.filter(query);
	}

	async findOne(id: number) {
		const employee = await this.db.employee.findUnique({
			where: { id },
			include: {
				position: true,
				user: {
					select: {
						email: true,
						fullName: true,
						username: true,
						roles: true,
						image: true,
					},
				},
			},
		});
		if (!employee) throw new NotFoundException('Empleado no encontrado');
		return new EmployeeDto(employee);
	}

	async update(id: number, dto: UpdateEmplyeeDto) {
		const employee = await this.db.employee.findUnique({ where: { id } });
		if (!employee) throw new NotFoundException('Empleado no encontrado');
		return await this.db.employee.update({
			where: { id },
			include: {
				position: true,
				user: {
					select: {
						email: true,
						fullName: true,
						username: true,
						roles: true,
						image: true,
					},
				},
			},
			data: dto,
		});
	}

	async remove(id: number) {
		const isExists = await this.db.employee.isExists({ id });
		if (!isExists) throw new NotFoundException('Empleado no encontrado');
		await this.db.employee.delete({ where: { id } });
	}

	private async filter(dto: EmployeeQueryDto) {
		const { baseWhere } = this.db.getBaseWhere(dto);
		const where: Prisma.EmployeeWhereInput = {
			...baseWhere,
			...this.getWhereByQuerySearch(dto.query),
			positionId: dto.positionId,
		};
		const [data, total] = await Promise.all([
			this.db.employee.findMany({
				...this.db.paginate(dto),
				where,
				include: {
					position: true,
					user: {
						select: {
							email: true,
							fullName: true,
							username: true,
							roles: true,
							image: true,
						},
					},
				},
			}),
			this.db.employee.count({ where }),
		]);
		return this.db.getPagOutput({
			page: dto.page,
			size: dto.size,
			total,
			data: data.map((e) => new EmployeeDto(e)),
		});
	}

	private getWhereByQuerySearch(query?: string) {
		let querySearchWhere: Prisma.EmployeeWhereInput = {};
		if (!query) return querySearchWhere;
		const searchQuery = query.trim();
		if (searchQuery.includes('@'))
			querySearchWhere.user = {
				email: { contains: searchQuery, mode: 'insensitive' },
			};
		if (/^\d+$/.test(searchQuery))
			querySearchWhere = {
				ruc: { contains: searchQuery, mode: 'insensitive' },
			};
		else
			querySearchWhere.user = {
				fullName: { contains: searchQuery, mode: 'insensitive' },
			};
		return querySearchWhere;
	}
}
