import { PrismaService } from '@features/prisma/prisma.service';
import { ScheduleService } from '../schedule/schedule.service';
import { TokenPayload } from '@features/auth-module/auth/types/auth.types';
import { AppointmentMapper } from './appointment.mapper';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { Prisma } from '@prisma/client';
import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';

@Injectable()
export class AppointmentCreatorService {
	constructor(
		private readonly db: PrismaService,
		private readonly scheduleService: ScheduleService,
	) {}

	async create(dto: CreateAppointmentDto, user: TokenPayload) {
		const {
			serviceIds,
			designatedDate,
			designatedTime,
			petId,
			employeeId,
			...rest
		} = dto;

		const pet = await this.getPetByUserKind(petId, user);
		if (!pet) {
			throw new NotFoundException(
				'La mascota no existe o no pertenece al cliente',
			);
		}

		const { totalDuration, appStart, appointmentDetailData } =
			await this.areAppDetailsValid(
				designatedDate,
				designatedTime,
				employeeId,
				serviceIds,
			);

		const appointment = await this.db.appointment.create({
			...this.getInclude(),
			data: {
				...rest,
				petId,
				employeeId,
				totalDuration,
				designatedDate: appStart,
				appointmentDetails: { create: appointmentDetailData },
			},
		});
		return AppointmentMapper.toDto(appointment);
	}

	private async areAppDetailsValid(
		initDate: string,
		initTime: string,
		employeeId: number,
		servicesIds: number[],
	) {
		const appointmentDetailData: Omit<
			Prisma.AppointmentDetailCreateInput,
			'appointment'
		>[] = [];
		let totalDuration = 0;
		let designatedTime = initTime;
		const appStart = new Date(`${initDate}T${initTime}`);
		for (const serviceId of servicesIds) {
			const service = await this.validateService(serviceId);
			const [startAt, endAt, nextTime] =
				await this.scheduleService.validateAppByEmployees(
					employeeId,
					initDate,
					designatedTime,
					service.durationMin,
				);
			appointmentDetailData.push({
				service: { connect: { id: service.id } },
				partialDuration: service.durationMin,
				startAt,
				endAt,
			});
			totalDuration += service.durationMin;
			designatedTime = this.scheduleService.toStrTime(nextTime);
		}
		return { totalDuration, appStart, appointmentDetailData };
	}

	private async validateService(id: number) {
		const service = await this.db.serviceType.findUnique({ where: { id } });
		if (!service) throw new BadRequestException('El servicio no existe');
		return service;
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

	private async getPetByUserKind(petId: number, user: TokenPayload) {
		return await this.db.pet.findUnique({
			where: {
				id: petId,
				clientId: user.clientId ? user.clientId : undefined,
			},
		});
	}
}
