import { Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { PrismaModule } from '@features/prisma/prisma.module';
import { ScheduleService } from '@features/appointment-module/schedule/schedule.service';

@Module({
	imports: [PrismaModule],
	controllers: [AppointmentController],
	providers: [AppointmentService, ScheduleService],
})
export class AppointmentModule {}
