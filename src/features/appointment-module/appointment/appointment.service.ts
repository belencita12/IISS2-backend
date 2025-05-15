import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { PrismaService } from '@features/prisma/prisma.service';
import { TokenPayload } from '@features/auth-module/auth/types/auth.types';
import { ScheduleService } from '@features/appointment-module/schedule/schedule.service';
import { AppointmentQueryDto } from './dto/appointment-query.dto';
import { AppointmentStatus } from '@prisma/client';
import { AppointmentCancelDto } from './dto/appointment-cancel.dto';
import { AppointmentFilter } from './appointment.filter';
import { AppointmentMapper } from './appointment.mapper';
import { AppointmentCreatorService } from './appointment-creator.service';

@Injectable()
export class AppointmentService {
	constructor(
		private readonly db: PrismaService,
		private readonly scheduleService: ScheduleService,
		private readonly appointmentCreationService: AppointmentCreatorService,
	) {}

	async create(dto: CreateAppointmentDto, user: TokenPayload) {
		return await this.appointmentCreationService.create(dto, user);
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
		if (appointment.designatedDate.toISOString() > new Date().toISOString()) {
			throw new BadRequestException(
				'No se puede finalizar una cita antes de la fecha designada',
			);
		}
		await this.db.appointment.update({
			where: { id: appId },
			data: { status: AppointmentStatus.COMPLETED },
		});
	}

	async findAll(query: AppointmentQueryDto, user: TokenPayload) {
		const { baseWhere } = this.db.getBaseWhere(query);
		const where = AppointmentFilter.getWhere(baseWhere, query, user);
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
			data: data.map((a) => AppointmentMapper.toDto(a)),
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

		return AppointmentMapper.toDto(appointment);
	}

	async remove(id: number) {
		const isExists = await this.db.appointment.isExists({ id });
		if (!isExists) throw new NotFoundException('No se ha encontrado la cita');
		return await this.db.appointment.softDelete({ id });
	}

	private getInclude() {
		return {
			include: {
				pet: { include: { race: true, client: { include: { user: true } } } },
				appointmentDetails: { include: { service: true } },
				employee: { include: { user: true } },
			},
		};
	}
}
