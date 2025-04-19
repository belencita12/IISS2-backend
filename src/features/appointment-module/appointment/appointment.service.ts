import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { PrismaService } from '@features/prisma/prisma.service';
import { TokenPayload } from '@features/auth-module/auth/types/auth.types';
import { AppointmentDto } from './dto/appointment.dto';
import { ScheduleService } from '@features/appointment-module/schedule/schedule.service';
import { AppointmentQueryDto } from './dto/appointment-query.dto';
import { AppointmentStatus, Prisma } from '@prisma/client';
import { AppointmentCancelDto } from './dto/appointment-cancel.dto';

@Injectable()
export class AppointmentService {
	constructor(
		private readonly db: PrismaService,
		private readonly scheduleService: ScheduleService,
	) {}

	async create(dto: CreateAppointmentDto, user: TokenPayload) {
		const service = await this.db.serviceType.findUnique({
			where: { id: dto.serviceId },
			select: { durationMin: true },
		});
		if (!service) throw new NotFoundException('Servicio no encontrado');

		const pet = await this.getPet(dto.petId, user);
		if (!pet) throw new NotFoundException('La mascota no fue encontrada');

		const { employeesId, designatedDate, designatedTime, ...data } = dto;

		const appDay = await this.scheduleService.validateAppByEmployees(
			employeesId,
			designatedDate,
			designatedTime,
			service.durationMin,
		);

		const appointment = await this.db.appointment.create({
			data: {
				...data,
				designatedDate: appDay,
				employee: this.connectEmployees(employeesId),
			},
			...this.getInclude(),
		});

		return new AppointmentDto(appointment);
	}

	async cancelAppointment(
		appId: number,
		dto: AppointmentCancelDto,
		user: TokenPayload,
	) {
		const emplId = user.employeeId!;
		const appointment = await this.db.appointment.findUnique({
			where: { id: appId, status: { not: AppointmentStatus.CANCELLED } },
		});
		if (!appointment) {
			throw new NotFoundException('La cita no existe o ya fue cancelada');
		}
		await this.db.appointment.update({
			where: { id: appId },
			data: {
				status: AppointmentStatus.CANCELLED,
				cancelation: {
					create: { details: dto.description, managerId: emplId },
				},
			},
		});
	}

	async completeAppointment(appId: number) {
		const appointment = await this.db.appointment.findUnique({
			where: { id: appId, status: AppointmentStatus.PENDING },
		});
		if (!appointment) {
			throw new NotFoundException('La cita no existe o no esta pendiente');
		}
		await this.db.appointment.update({
			where: { id: appId },
			data: { status: AppointmentStatus.COMPLETED },
		});
	}

	async findAll(query: AppointmentQueryDto) {
		const where = this.getFindAllWhere(query);
		const [data, count] = await Promise.all([
			this.db.appointment.findMany({
				...this.db.paginate(query),
				...this.getInclude(),
				where,
			}),
			this.db.appointment.count({ where }),
		]);
		return this.db.getPagOutput({
			page: query.page,
			size: query.size,
			total: count,
			data: data.map((a) => new AppointmentDto(a)),
		});
	}

	async getScheduleByEmployee(id: number, date: string) {
		const localDate = new Date(date);
		return await this.scheduleService.getScheduleByEmployeeId(id, localDate);
	}

	async findOne(id: number) {
		const appointment = await this.db.appointment.findUnique({
			...this.getInclude(),
			where: { id },
		});

		if (!appointment)
			throw new NotFoundException('No se ha encontrado la cita');

		return new AppointmentDto(appointment);
	}

	async remove(id: number) {
		const isExists = await this.db.appointment.isExists({ id });
		if (!isExists) throw new NotFoundException('No se ha encontrado la cita');
		return await this.db.appointment.softDelete({ id });
	}

	private getFindAllWhere(query: AppointmentQueryDto) {
		const { baseWhere } = this.db.getBaseWhere(query);
		const where: Prisma.AppointmentWhereInput = { ...baseWhere };

		if (query.status) where.status = query.status;

		if (query.fromDesignatedDate || query.toDesignatedDate) {
			where.designatedDate = {
				gte: query.fromDesignatedDate,
				lte: query.toDesignatedDate,
			};
		}

		if (query.employeeRuc) {
			where.employee = {
				some: {
					user: { ruc: { contains: query.employeeRuc, mode: 'insensitive' } },
				},
			};
		}

		if (query.clientRuc) {
			where.pet = {
				client: {
					user: { ruc: { contains: query.clientRuc, mode: 'insensitive' } },
				},
			};
		}

		return where;
	}

	private getInclude() {
		return {
			include: {
				pet: { include: { race: true, client: { include: { user: true } } } },
				employee: { include: { user: true } },
				service: true,
			},
		};
	}

	private connectEmployees(idList: number[]) {
		return {
			connect: idList.map((id) => ({
				id,
			})),
		};
	}

	private async getPet(petId: number, user: TokenPayload) {
		return await this.db.pet.findUnique({
			where: {
				id: petId,
				clientId: user.clientId ? user.clientId : undefined,
			},
		});
	}
}
