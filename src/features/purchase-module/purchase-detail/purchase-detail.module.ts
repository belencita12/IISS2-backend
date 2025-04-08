import { Module } from '@nestjs/common';
import { PurchaseDetailService } from './purchase-detail.service';
import { PurchaseDetailController } from './purchase-detail.controller';
import { PrismaModule } from '@features/prisma/prisma.module';
import { AuthModule } from '@features/auth-module/auth/auth.module';
import { StockValidationService } from '@features/stock-module/movement/stock-validation.service';

@Module({
	imports: [PrismaModule, AuthModule],
	controllers: [PurchaseDetailController],
	providers: [PurchaseDetailService, StockValidationService],
	exports: [PurchaseDetailService],
})
export class PurchaseDetailModule {}
