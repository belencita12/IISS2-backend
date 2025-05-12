import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { AuthModule } from '@features/auth-module/auth/auth.module';
import { ImageModule } from '@features/media-module/image/image.module';
import { PrismaModule } from '@features/prisma/prisma.module';
import { TagModule } from '../tag/tag.module';
import { ProductPricingService } from './product-pricing.service';

@Module({
	imports: [AuthModule, PrismaModule, ImageModule, TagModule],
	providers: [ProductService, ProductPricingService],
	exports: [ProductService, ProductPricingService],
	controllers: [ProductController],
})
export class ProductModule {}
