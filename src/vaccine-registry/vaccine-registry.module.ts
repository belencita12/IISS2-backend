import { Module } from '@nestjs/common';
import { VaccineRegistryService } from './vaccine-registry.service';
import { VaccineRegistryController } from './vaccine-registry.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { AuthModule } from '@/auth/auth.module';

@Module({
	imports: [PrismaModule, AuthModule],
	controllers: [VaccineRegistryController],
	providers: [VaccineRegistryService],
})
export class VaccineRegistryModule {}
