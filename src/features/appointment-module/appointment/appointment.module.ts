import { Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { PrismaModule } from '@features/prisma/prisma.module';
import { ScheduleService } from '@features/appointment-module/schedule/schedule.service';
import { AppointmentCreatorService } from './appointment-creator.service';
import { AppointmentReport } from './appointment.report';
import { IsAppointmentOwnerGuard } from './guards/is-appointment-owner.guard';

@Module({
	imports: [PrismaModule],
	controllers: [AppointmentController],
	providers: [
		AppointmentService,
		ScheduleService,
		AppointmentCreatorService,
		AppointmentReport,
		IsAppointmentOwnerGuard,
	],
})
export class AppointmentModule {}
