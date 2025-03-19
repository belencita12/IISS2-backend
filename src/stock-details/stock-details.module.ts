import { Module } from '@nestjs/common';
import { StockDetailsService } from './stock-details.service';
import { StockDetailsController } from './stock-details.controller';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
	imports: [PrismaModule],
	controllers: [StockDetailsController],
	providers: [StockDetailsService],
})
export class StockDetailsModule {}
