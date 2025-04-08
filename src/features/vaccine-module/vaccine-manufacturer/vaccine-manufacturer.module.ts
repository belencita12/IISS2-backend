import { Module } from '@nestjs/common';
import { VaccineManufacturerService } from './vaccine-manufacturer.service';
import { VaccineManufacturerController } from './vaccine-manufacturer.controller';
import { AuthModule } from '@features/auth-module/auth/auth.module';
import { PrismaModule } from '@features/prisma/prisma.module';

@Module({
	imports: [PrismaModule, AuthModule],
	controllers: [VaccineManufacturerController],
	providers: [VaccineManufacturerService],
})
export class VaccineManufacturerModule {}
