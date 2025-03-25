import { Module } from '@nestjs/common';
import { ProviderService } from './provider.service';
import { ProviderController } from './provider.controller';
import { PrismaModule } from '@features/prisma/prisma.module';
import { AuthModule } from '@features/auth-module/auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ProviderController],
  providers: [ProviderService],
})
export class ProviderModule {}

