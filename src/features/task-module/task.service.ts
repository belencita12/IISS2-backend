import { CronJob } from 'cron';
import { Prisma } from '@prisma/client';
import { SchedulerRegistry } from '@nestjs/schedule';
import { EnvService } from '@features/global-module/env/env.service';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { NotificationMapper } from '@features/notification/notification.mapper';
import { NotificationGateway } from '@features/notification/notification.gateway';
import { TaskVaccineNotificationService } from './providers/task-vaccine-notification.service';
import { TaskAppointmentNotificationService } from './providers/task-appointment-notification.service';
import {
	ExtendedTransaction,
	PrismaService,
} from '@features/prisma/prisma.service';
import { NotificationEmailService } from '@features/notification/notification-email.service';

@Injectable()
export class TaskService implements OnModuleInit {
	private readonly logger = new Logger(TaskService.name);

	constructor(
		private readonly env: EnvService,
		private readonly db: PrismaService,
		private readonly gateway: NotificationGateway,
		private readonly schedulerRegistry: SchedulerRegistry,
		private readonly notificationEmailService: NotificationEmailService,
		private readonly taskVaccNotification: TaskVaccineNotificationService,
		private readonly taskAppNotification: TaskAppointmentNotificationService,
	) {}

	onModuleInit() {
		const cronTime = this.env.get('CRON_NOTIFICATION_TIME');
		const timeZone = this.env.get('SYS_TIME_ZONE');

		if (!cronTime) {
			this.logger.warn(
				'Notification cron job not scheduled by lack of CRON_NOTIFICATION_TIME.',
			);
			return;
		}

		const job = new CronJob(
			cronTime,
			() => this.notificationCron(),
			null,
			true,
			timeZone,
		);

		this.schedulerRegistry.addCronJob('notification-cron', job);
		job.start();

		this.logger.debug('Notification cron job scheduled.');
	}

	private async notificationCron() {
		this.logger.debug('Notification Cron started');

		this.logger.debug('Getting vaccine registries to notify...');
		const vaccNotifications = await this.taskVaccNotification.execute();
		this.logger.debug(
			`Got ${vaccNotifications.length} vaccine registries to notify`,
		);

		this.logger.debug('Getting appointments to notify...');
		const appNotifications = await this.taskAppNotification.execute();
		this.logger.debug(`Got ${appNotifications.length} appointments to notify`);

		const notifications = [...vaccNotifications, ...appNotifications];
		this.logger.debug('Got notifications');

		this.logger.debug('Creating and emitting notifications...');
		await this.db.$transaction(async (tx) => {
			for (const {
				data,
				userId,
				userEmail,
				userRoles,
				date,
			} of notifications) {
				await this.createAndEmitNotification(
					tx,
					data,
					userId,
					date,
					userEmail,
					userRoles,
				);
			}
		});

		this.logger.debug('Notification Cron finished');
	}

	private async createAndEmitNotification(
		tx: ExtendedTransaction,
		data: Prisma.UserNotificationCreateInput,
		userId: number,
		date: string,
		userEmail: string,
		userRoles: { name: string }[],
	) {
		const notification = await tx.userNotification.create({
			include: { notification: true },
			data,
		});
		const message = NotificationMapper.toMessageFromEntity(notification);
		this.notificationEmailService.sendEmail({
			...message,
			userEmail,
			userRoles,
			date,
		});
		this.gateway.sendToUser(
			userId.toString(),
			NotificationMapper.toDto(notification),
		);
	}
}
