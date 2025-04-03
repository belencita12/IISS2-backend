import { Module } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { PurchaseController } from './purchase.controller';
import { PrismaModule } from '@features/prisma/prisma.module';
import { AuthModule } from '@features/auth-module/auth/auth.module';
import { StockValidationService } from '@features/stock-module/movement/stock-validation.service';
import { PurchaseDetailModule } from '../purchase-detail/purchase-detail.module';

@Module({
	imports: [PrismaModule, AuthModule, PurchaseDetailModule],
	controllers: [PurchaseController],
	providers: [PurchaseService, StockValidationService],
})
export class PurchaseModule {}
