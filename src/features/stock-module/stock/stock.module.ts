import { Module } from '@nestjs/common';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';
import { PrismaModule } from '@features/prisma/prisma.module';
import { StampedModule } from '@features/invoice-module/stamped/stamped.module';

@Module({
	imports: [PrismaModule, StampedModule],
	controllers: [StockController],
	providers: [StockService],
})
export class StockModule {}
