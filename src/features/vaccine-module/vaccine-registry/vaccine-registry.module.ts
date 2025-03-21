import { Module } from '@nestjs/common';
import { VaccineRegistryService } from './vaccine-registry.service';
import { VaccineRegistryController } from './vaccine-registry.controller';
import { AuthModule } from '@features/auth-module/auth/auth.module';
import { PrismaModule } from '@features/prisma/prisma.module';

@Module({
	imports: [PrismaModule, AuthModule],
	controllers: [VaccineRegistryController],
	providers: [VaccineRegistryService],
})
export class VaccineRegistryModule {}
