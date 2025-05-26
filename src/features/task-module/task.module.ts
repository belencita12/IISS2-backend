import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { PrismaModule } from '@features/prisma/prisma.module';
import { TaskVaccineNotificationService } from './providers/task-vaccine-notification.service';
import { TaskAppointmentNotificationService } from './providers/task-appointment-notification.service';

@Module({
	imports: [PrismaModule],
	providers: [
		TaskService,
		TaskVaccineNotificationService,
		TaskAppointmentNotificationService,
	],
})
export class TaskModule {}
