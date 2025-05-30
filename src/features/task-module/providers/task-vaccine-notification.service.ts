import { DateService } from '@features/global-module/date/date.service';
import { PrismaService } from '@features/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { NotificationScope, NotificationType, Prisma } from '@prisma/client';

@Injectable()
export class TaskVaccineNotificationService {
	constructor(
		private readonly db: PrismaService,
		private readonly dateService: DateService,
	) {}

	async execute() {
		const vaccineRegistries = await this.findVaccineRegistries();
		const userNotData: {
			data: Prisma.UserNotificationCreateInput;
			userId: number;
			userEmail: string;
			userRoles: { name: string }[];
			date: string;
		}[] = [];
		const title = 'Recordatorio de vacunas';
		vaccineRegistries.forEach((vaccReg) => {
			const description = this.generateDescription(
				vaccReg.pet.client.user.fullName,
				vaccReg.pet.name,
				vaccReg.expectedDate.toLocaleDateString('es-Py'),
			);
			userNotData.push({
				data: {
					user: { connect: { id: vaccReg.pet.client.userId } },
					notification: {
						create: {
							title,
							description,
							vaccineRegistryId: vaccReg.id,
							scope: NotificationScope.TO_USER,
							type: NotificationType.VACCINE_REMAINDER,
						},
					},
				},
				date: vaccReg.expectedDate.toLocaleDateString('es-Py'),
				userEmail: vaccReg.pet.client.user.email,
				userRoles: vaccReg.pet.client.user.roles,
				userId: vaccReg.pet.client.userId,
			});
		});
		return userNotData;
	}

	private async findVaccineRegistries() {
		const firstRange = this.dateService.getRangeFromTodayTo(3);
		const secondRange = this.dateService.getRangeFromTodayTo(1);
		return await this.db.vaccineRegistry.findMany({
			select: {
				id: true,
				expectedDate: true,
				pet: {
					select: {
						name: true,
						client: {
							select: {
								userId: true,
								user: { select: { email: true, roles: true, fullName: true } },
							},
						},
					},
				},
			},
			where: {
				OR: [{ expectedDate: firstRange }, { expectedDate: secondRange }],
				pet: { deletedAt: null, client: { deletedAt: null } },
				applicationDate: null,
				deletedAt: null,
			},
		});
	}

	private generateDescription(
		clientFullName: string,
		petName: string,
		dateStr: string,
	) {
		return `Estimado/a ${clientFullName}, recuerde vacunar a su mascota ${petName} el dia ${dateStr}.`;
	}
}
