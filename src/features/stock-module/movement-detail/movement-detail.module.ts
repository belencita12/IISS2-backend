import { Module } from '@nestjs/common';
import { MovementDetailService } from './movement-detail.service';
import { MovementDetailController } from './movement-detail.controller';
import { PrismaModule } from '@features/prisma/prisma.module';

@Module({
	imports: [PrismaModule],
	controllers: [MovementDetailController],
	providers: [MovementDetailService],
})
export class MovementDetailModule {}
