import { Module } from '@nestjs/common';
import { VaccineManufacturerService } from './vaccine-manufacturer.service';
import { VaccineManufacturerController } from './vaccine-manufacturer.controller';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [VaccineManufacturerController],
  providers: [VaccineManufacturerService],
})
export class VaccineManufacturerModule {}
