import { Module } from '@nestjs/common';
import { VaccineService } from './vaccine.service';
import { VaccineController } from './vaccine.controller';
import { AuthModule } from '@features/auth-module/auth/auth.module';
import { PrismaModule } from '@features/prisma/prisma.module';
import { ProductModule } from '@features/product-module/product/product.module';

@Module({
	imports: [PrismaModule, AuthModule, ProductModule],
	controllers: [VaccineController],
	providers: [VaccineService],
})
export class VaccineModule {}
