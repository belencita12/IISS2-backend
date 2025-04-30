import { Module } from '@nestjs/common';
import { ProductCostController } from './product-cost.controller';
import { ProductCostService } from './product-cost.service';
import { PrismaModule } from '@features/prisma/prisma.module';

@Module({
	imports: [PrismaModule],
	controllers: [ProductCostController],
	providers: [ProductCostService],
	exports: [ProductCostService],
})
export class ProductCostModule {}
