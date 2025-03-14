import { Module } from '@nestjs/common';
import { VaccineManufacturerService } from './vaccine-manufacturer.service';
import { VaccineManufacturerController } from './vaccine-manufacturer.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { AuthModule } from '@/auth/auth.module';

@Module({
	imports: [PrismaModule, AuthModule],
	controllers: [VaccineManufacturerController],
	providers: [VaccineManufacturerService],
})
export class VaccineManufacturerModule {}
