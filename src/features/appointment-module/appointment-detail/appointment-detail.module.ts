import { Module } from '@nestjs/common';
import { AppointmentDetailService } from './appointment-detail.service';
import { AppointmentDetailController } from './appointment-detail.controller';

@Module({
	providers: [AppointmentDetailService],
	controllers: [AppointmentDetailController],
})
export class AppointmentDetailModule {}
