import { Prisma } from '@prisma/client';
import { AppointmentDetailQueryDto } from './dto/appointment-detail-query.dto';

export class AppointmentDetailFilter {
	static getWhere(
		baseWhere: Prisma.AppointmentDetailWhereInput,
		query: AppointmentDetailQueryDto,
	): Prisma.AppointmentDetailWhereInput {
		return {
			...baseWhere,
			appointmentId: query.appointmentId,
			serviceId: query.serviceId,
			startAt: query.endAt ? { lte: query.startAt } : undefined,
			endAt: query.endAt ? { lte: query.endAt } : undefined,
			partialDuration:
				query.fromPartialDuration || query.toPartialDuration
					? { gte: query.fromPartialDuration, lte: query.toPartialDuration }
					: undefined,
		};
	}
}
