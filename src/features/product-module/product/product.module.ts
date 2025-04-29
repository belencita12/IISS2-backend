import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { AuthModule } from '@features/auth-module/auth/auth.module';
import { ImageModule } from '@features/media-module/image/image.module';
import { PrismaModule } from '@features/prisma/prisma.module';
import { TagModule } from '../tag/tag.module';

@Module({
	imports: [AuthModule, PrismaModule, ImageModule, TagModule],
	controllers: [ProductController],
	providers: [ProductService],
	exports: [ProductService],
})
export class ProductModule {}
