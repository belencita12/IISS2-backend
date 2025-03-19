import { Module } from '@nestjs/common';
import { MovementDetailsService } from './movement-details.service';
import { MovementDetailsController } from './movement-details.controller';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
	imports: [PrismaModule],
	controllers: [MovementDetailsController],
	providers: [MovementDetailsService],
})
export class MovementDetailsModule {}
