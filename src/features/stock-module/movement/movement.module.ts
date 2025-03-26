import { Module } from '@nestjs/common';
import { MovementService } from './movement.service';
import { MovementController } from './movement.controller';
import { PrismaModule } from '@features/prisma/prisma.module';
import { StockValidationService } from './stock-validation.service';

@Module({
	imports: [PrismaModule],
	controllers: [MovementController],
	providers: [MovementService, StockValidationService],
})
export class MovementModule {}
