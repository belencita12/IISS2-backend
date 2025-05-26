import { Cron } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';
import { Injectable, Logger } from '@nestjs/common';
import { NotificationMapper } from '@features/notification/notification.mapper';
import { NotificationGateway } from '@features/notification/notification.gateway';
import { TaskVaccineNotificationService } from './providers/task-vaccine-notification.service';
import { TaskAppointmentNotificationService } from './providers/task-appointment-notification.service';
import {
	ExtendedTransaction,
	PrismaService,
} from '@features/prisma/prisma.service';

@Injectable()
export class TaskService {
	private readonly logger = new Logger(TaskService.name);

	constructor(
		private readonly db: PrismaService,
		private readonly gateway: NotificationGateway,
		private readonly taskVaccNotification: TaskVaccineNotificationService,
		private readonly taskAppNotification: TaskAppointmentNotificationService,
	) {}

	@Cron('0 0 3 * * *', { timeZone: 'America/Asunción' })
	async notificationCron() {
		this.logger.debug('Notification Cron started');

		this.logger.debug('Getting vaccine registries to notify...');
		const vaccNotifications = await this.taskVaccNotification.execute();
		this.logger.debug('Got vaccine registries to notify');

		this.logger.debug('Getting appointments to notify...');
		const appNotifications = await this.taskAppNotification.execute();
		this.logger.debug('Got appointments to notify');

		const notifications = [...vaccNotifications, ...appNotifications];
		this.logger.debug('Got notifications');

		this.logger.debug('Creating and emitting notifications...');
		await this.db.$transaction(async (tx) => {
			for (const { data, userId } of notifications) {
				await this.createAndEmitNotification(tx, data, userId);
			}
		});

		this.logger.debug('Notification Cron finished');
	}

	private async createAndEmitNotification(
		tx: ExtendedTransaction,
		data: Prisma.UserNotificationCreateInput,
		userId: number,
	) {
		const notification = await tx.userNotification.create({
			include: { notification: true },
			data,
		});
		this.gateway.sendToUser(
			userId.toString(),
			NotificationMapper.toDto(notification),
		);
	}
}
