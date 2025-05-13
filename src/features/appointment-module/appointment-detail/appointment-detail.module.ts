import { Module } from '@nestjs/common';
import { AppointmentDetailService } from './appointment-detail.service';
import { AppointmentDetailController } from './appointment-detail.controller';
import { PrismaModule } from '@features/prisma/prisma.module';

@Module({
	imports: [PrismaModule],
	providers: [AppointmentDetailService],
	controllers: [AppointmentDetailController],
})
export class AppointmentDetailModule {}
