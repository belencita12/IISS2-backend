import { Module } from '@nestjs/common';
import { VaccineBatchService } from './vaccine-batch.service';
import { VaccineBatchController } from './vaccine-batch.controller';
import { AuthModule } from '@features/auth-module/auth/auth.module';
import { PrismaModule } from '@features/prisma/prisma.module';

@Module({
	imports: [PrismaModule, AuthModule],
	controllers: [VaccineBatchController],
	providers: [VaccineBatchService],
})
export class VaccineBatchModule {}
