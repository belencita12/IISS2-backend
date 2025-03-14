import { Module } from '@nestjs/common';
import { StockDetailsService } from './stock-details.service';
import { StockDetailsController } from './stock-details.controller';

@Module({
	controllers: [StockDetailsController],
	providers: [StockDetailsService],
})
export class StockDetailsModule {}
