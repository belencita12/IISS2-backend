import { Module } from '@nestjs/common';
import { WorkPositionService } from './work-position.service';
import { WorkPositionController } from './work-position.controller';
import { AuthModule } from '@features/auth-module/auth/auth.module';
import { PrismaModule } from '@features/prisma/prisma.module';
import { ScheduleService } from '@features/appointment-module/schedule/schedule.service';

@Module({
	imports: [PrismaModule, AuthModule],
	controllers: [WorkPositionController],
	providers: [WorkPositionService, ScheduleService],
})
export class WorkPositionModule {}
