import { PrismaService } from '@features/prisma/prisma.service';
import { ScheduleService } from '../schedule/schedule.service';
import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { TokenPayload } from '@features/auth-module/auth/types/auth.types';
import { AppointmentMapper } from './appointment.mapper';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { CreateAppointmentDetailDto } from '../appointment-detail/dto/create-appointment-detail.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AppointmentCreatorService {
	constructor(
		private readonly db: PrismaService,
		private readonly scheduleService: ScheduleService,
	) {}

	async create(dto: CreateAppointmentDto, user: TokenPayload) {
		const {
			appointmentDetails,
			designatedDate,
			designatedTime,
			petId,
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
				appointmentDetails,
			);

		const appointment = await this.db.appointment.create({
			...this.getInclude(),
			data: {
				...rest,
				petId,
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
		appDetails: CreateAppointmentDetailDto[],
	) {
		const appointmentDetailData: Omit<
			Prisma.AppointmentDetailCreateInput,
			'appointment'
		>[] = [];
		let totalDuration = 0;
		let designatedTime = initTime;
		const appStart = new Date(`${initDate}T${initTime}`);
		for (const appDetail of appDetails) {
			const { serviceId, employeeIds } = appDetail;
			const service = await this.validateService(serviceId, employeeIds);
			const [startAt, endAt, nextTime] =
				await this.scheduleService.validateAppByEmployees(
					employeeIds,
					initDate,
					designatedTime,
					service.durationMin,
				);
			appointmentDetailData.push({
				employees: { connect: employeeIds.map((id) => ({ id })) },
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

	private async validateService(id: number, employeeIds: number[]) {
		const service = await this.db.serviceType.findUnique({ where: { id } });
		if (!service) throw new BadRequestException('El servicio no existe');
		if (service.maxColabs && service.maxColabs < employeeIds.length) {
			throw new BadRequestException(
				'La cant. de empleados excede a la cant. maxima de colaboradores que soporta el servicio.',
			);
		}
		return service;
	}

	private getInclude() {
		return {
			include: {
				pet: { include: { race: true, client: { include: { user: true } } } },
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
