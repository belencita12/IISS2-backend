import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { PrismaModule } from '@features/prisma/prisma.module';
import { TaskVaccineNotificationService } from './providers/task-vaccine-notification.service';
import { TaskAppointmentNotificationService } from './providers/task-appointment-notification.service';
import { NotificationModule } from '@features/notification/notification.module';

@Module({
	imports: [PrismaModule, NotificationModule],
	providers: [
		TaskService,
		TaskVaccineNotificationService,
		TaskAppointmentNotificationService,
	],
})
export class TaskModule {}
