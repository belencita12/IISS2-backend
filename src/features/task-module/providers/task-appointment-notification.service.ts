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
		const firstRange = this.dateService.getRangeFromTodayTo(3);
		const secondRange = this.dateService.getRangeFromTodayTo(1);
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
				OR: [{ designatedDate: firstRange }, { designatedDate: secondRange }],
				pet: { deletedAt: null, client: { deletedAt: null } },
				deletedAt: null,
			},
		});
		const appNotData: {
			data: Prisma.UserNotificationCreateInput;
			userId: number;
		}[] = [];
		const title = 'Recordatorio de cita';
		appointments.forEach((appointment) => {
			const description = this.generateDescription(
				appointment.pet.client.user.fullName,
				appointment.pet.name,
				appointment.designatedDate.toLocaleDateString('es-Py'),
			);
			appNotData.push({
				data: {
					user: { connect: { id: appointment.pet.client.userId } },
					notification: {
						create: {
							title,
							description,
							appointmentId: appointment.id,
							scope: NotificationScope.TO_USER,
							type: NotificationType.APPOINTMENT_REMINDER,
						},
					},
				},
				userId: appointment.pet.client.userId,
			});
		});
		return appNotData;
	}

	private generateDescription(
		clientFullName: string,
		petName: string,
		dateStr: string,
	) {
		return `Estimado/a ${clientFullName}, recuerde la cita de su mascota ${petName} la fecha ${dateStr}.`;
	}
}
