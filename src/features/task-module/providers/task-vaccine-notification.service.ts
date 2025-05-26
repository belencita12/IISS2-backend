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
		}[] = [];
		const title = 'Recordatorio de vacunas';
		vaccineRegistries.forEach((vaccReg) => {
			const description = this.generateDescription(
				vaccReg.pet.client.user.fullName,
				vaccReg.pet.name,
				vaccReg.expectedDate.toISOString().split('T')[0],
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
				userId: vaccReg.pet.client.userId,
			});
		});
		return userNotData;
	}

	private async findVaccineRegistries() {
		const rangeThreeDaysAhead = this.dateService.getRangePlusDays(3);
		const rangeOneDayAhead = this.dateService.getRangePlusDays(1);
		return await this.db.vaccineRegistry.findMany({
			select: {
				id: true,
				expectedDate: true,
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
					{ expectedDate: rangeThreeDaysAhead },
					{ expectedDate: rangeOneDayAhead },
				],
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
