import { AppointmentDetail } from '@prisma/client';
import { AppointmentDetailDto } from './dto/appointment-detail.dto';
import {
	ServiceTypeDto,
	ServiceTypeEntity,
} from '@features/service-type/dto/service-type.dto';
import { ServiceTypeMapper } from '@features/service-type/service-type.mapper';

export interface AppointmentDetailEntity extends AppointmentDetail {
	service: ServiceTypeEntity;
}

export class AppointmentDetailMapper {
	static toDto(data: AppointmentDetailEntity): AppointmentDetailDto {
		return {
			id: data.id,
			appointmentId: data.appointmentId,
			startAt: data.startAt,
			endAt: data.endAt,
			partialDuration: data.partialDuration,
			service: ServiceTypeMapper.toDto(data.service) as ServiceTypeDto,
		};
	}
}
