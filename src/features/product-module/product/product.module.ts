import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { AuthModule } from '@features/auth-module/auth/auth.module';
import { ImageModule } from '@features/media-module/image/image.module';
import { PrismaModule } from '@features/prisma/prisma.module';
import { TagModule } from '../tag/tag.module';
import { ProductPriceModule } from '../product-price/product-price.module';
import { ProductCostModule } from '../product-cost/product-cost.module';

@Module({
	imports: [
		AuthModule,
		PrismaModule,
		ImageModule,
		ProductPriceModule,
		ProductCostModule,
		TagModule,
	],
	controllers: [ProductController],
	providers: [ProductService],
	exports: [ProductService],
})
export class ProductModule {}
