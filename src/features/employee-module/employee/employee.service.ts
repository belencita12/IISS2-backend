import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { EmployeeDto } from './dto/employee.dto';
import { EmployeeQueryDto } from './dto/employee.query.dto';
import { Prisma } from '@prisma/client';
import { AuthService } from '@features/auth-module/auth/auth.service';
import { ImageService } from '@features/media-module/image/image.service';
import { PrismaService } from '@features/prisma/prisma.service';
import { genPassword, genUsername } from '@lib/utils/encrypt';
import { onlyNumbers } from '@lib/utils/reg-exp';

@Injectable()
export class EmployeeService {
	constructor(
		private readonly db: PrismaService,
		private readonly imgService: ImageService,
		private readonly authService: AuthService,
	) {}

	async create(dto: CreateEmployeeDto) {
		const { profileImg, positionId, ...data } = dto;

		const isPosExists = await this.db.workPosition.isExists({
			id: positionId,
		});
		if (!isPosExists)
			throw new NotFoundException('Posicion de trabajo no encontrada');

		const password = await genPassword();
		const username = genUsername(dto.fullName);

		const img = profileImg ? await this.imgService.create(profileImg) : null;

		const employee = await this.db.employee.create({
			include: {
				position: true,
				user: { include: { roles: true, image: true } },
			},
			data: {
				position: { connect: { id: positionId } },
				user: {
					create: {
						...data,
						username,
						password,
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
		this.authService.getResetPassToken(dto.email);
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
				user: { include: { roles: true, image: true } },
			},
		});
		if (!employee) throw new NotFoundException('Empleado no encontrado');
		return new EmployeeDto(employee);
	}

	async update(id: number, dto: CreateEmployeeDto) {
		const prev = await this.db.employee.findFirst({
			where: { id },
			include: { user: { include: { image: true } } },
		});
		if (!prev) throw new NotFoundException('Empleado no encontrado');

		const img = await this.imgService.upsert(prev.user.image, dto.profileImg);

		const data: Prisma.EmployeeUpdateInput = {
			position: {
				connect: { id: dto.positionId },
			},
			user: {
				update: {
					ruc: dto.ruc,
					email: dto.email,
					fullName: dto.fullName,
					image: img?.id ? { connect: { id: img.id } } : undefined,
					username:
						dto.fullName != prev.user.fullName
							? genUsername(dto.fullName)
							: undefined,
				},
			},
		};

		const updated = await this.db.employee.update({
			where: { id },
			data,
			include: {
				position: true,
				user: { include: { roles: true, image: true } },
			},
		});

		return new EmployeeDto(updated);
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
			position: {
				id: dto.positionId,
				name: dto.positionName
					? { contains: dto.positionName, mode: 'insensitive' }
					: undefined,
			},
		};
		const [data, total] = await Promise.all([
			this.db.employee.findMany({
				...this.db.paginate(dto),
				where,
				include: {
					position: true,
					user: { include: { roles: true, image: true } },
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
		const querySearchWhere: Prisma.EmployeeWhereInput = {};
		if (!query) return querySearchWhere;
		const searchQuery = query.trim();
		if (searchQuery.includes('@')) {
			querySearchWhere.user = {
				email: { contains: searchQuery, mode: 'insensitive' },
			};
		} else if (onlyNumbers.test(searchQuery)) {
			querySearchWhere.user = {
				OR: [
					{ ruc: { contains: searchQuery, mode: 'insensitive' } },
					{ phoneNumber: { contains: searchQuery, mode: 'insensitive' } },
				],
			};
		} else {
			querySearchWhere.user = {
				OR: [
					{ fullName: { contains: searchQuery, mode: 'insensitive' } },
					{ adress: { contains: searchQuery, mode: 'insensitive' } },
				],
			};
		}
		return querySearchWhere;
	}
}
