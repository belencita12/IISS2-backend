import { DateService } from '@features/global-module/date/date.service';
import { PrismaService } from '@features/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { NotificationScope, NotificationType, Prisma } from '@prisma/client';

@Injectable()
export class TaskAppointmentNotificationService {
	constructor(
		private readonly db: PrismaService,
		private readonly dateService: DateService,
	) {}

	async execute() {
		const rangeThreeDaysAhead = this.dateService.getRangePlusDays(3);
		const rangeOneDayAhead = this.dateService.getRangePlusDays(1);
		const appointments = await this.db.appointment.findMany({
			select: {
				id: true,
				designatedDate: true,
				pet: {
					select: {
						name: true,
						client: {
							select: { userId: true, user: { select: { fullName: true } } },
						},
					},
				},
			},
			where: {
				OR: [
					{ designatedDate: rangeThreeDaysAhead },
					{ designatedDate: rangeOneDayAhead },
				],
				pet: { deletedAt: null, client: { deletedAt: null } },
				deletedAt: null,
			},
		});
		const appNotData: {
			data: Prisma.UserNotificationCreateInput;
			userId: number;
		}[] = [];
		const title = 'Recordatorio de vacunas';
		appointments.forEach((appointment) => {
			const description = `Estimado/a ${appointment.pet.client.user.fullName}, recuerde la cita de su mascota ${appointment.pet.name} la fecha ${appointment.designatedDate.toLocaleString('py-Py')}.`;
			appNotData.push({
				data: {
					user: { connect: { id: appointment.pet.client.userId } },
					notification: {
						create: {
							title,
							description,
							appointmentId: appointment.id,
							scope: NotificationScope.TO_USER,
							type: NotificationType.VACCINE_REMAINDER,
						},
					},
				},
				userId: appointment.pet.client.userId,
			});
		});
		return appNotData;
	}
}
