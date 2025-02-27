import { Module } from '@nestjs/common';
import { PetService } from './pet.service';
import { PetController } from './pet.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { AuthModule } from '@/auth/auth.module';

@Module({
	imports: [PrismaModule, AuthModule],
	controllers: [PetController],
	providers: [PetService],
})
export class PetModule {}
