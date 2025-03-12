import { Module } from '@nestjs/common';
import { WorkPositionService } from './work-position.service';
import { WorkPositionController } from './work-position.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { AuthModule } from '@/auth/auth.module';

@Module({
	imports: [PrismaModule, AuthModule],
	controllers: [WorkPositionController],
	providers: [WorkPositionService],
})
export class WorkPositionModule {}
