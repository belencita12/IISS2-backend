import { Module } from '@nestjs/common';
import { ProductPriceService } from './product-price.service';
import { ProductPriceController } from './product-price.controller';
import { AuthModule } from '@features/auth-module/auth/auth.module';
import { PrismaModule } from '@features/prisma/prisma.module';

@Module({
	imports: [AuthModule, PrismaModule],
	controllers: [ProductPriceController],
	providers: [ProductPriceService],
	exports: [ProductPriceService],
})
export class ProductPriceModule {}
