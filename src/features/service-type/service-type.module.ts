import { Module } from '@nestjs/common';
import { ServiceTypeService } from './service-type.service';
import { ServiceTypeController } from './service-type.controller';
import { PrismaModule } from '@features/prisma/prisma.module';
import { ImageModule } from '@features/media-module/image/image.module';
import { TagModule } from '@features/product-module/tag/tag.module';
import { ProductModule } from '@features/product-module/product/product.module';

@Module({
	imports: [PrismaModule, ImageModule, TagModule, ProductModule],
	controllers: [ServiceTypeController],
	providers: [ServiceTypeService],
})
export class ServiceTypeModule {}
