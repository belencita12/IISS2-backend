import { Module } from '@nestjs/common';
import { VaccineBatchService } from './vaccine-batch.service';
import { VaccineBatchController } from './vaccine-batch.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [VaccineBatchController],
  providers: [VaccineBatchService],
})
export class VaccineBatchModule {}
