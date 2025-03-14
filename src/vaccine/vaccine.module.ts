import { Module } from '@nestjs/common';
import { VaccineService } from './vaccine.service';
import { VaccineController } from './vaccine.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { AuthModule } from '@/auth/auth.module';
import { ProductModule } from '@/product/product.module';

@Module({
	imports: [PrismaModule, AuthModule, ProductModule],
	controllers: [VaccineController],
	providers: [VaccineService],
})
export class VaccineModule {}
