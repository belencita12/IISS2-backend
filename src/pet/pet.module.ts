import { Module } from '@nestjs/common';
import { PetService } from './pet.service';
import { PetController } from './pet.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { AuthModule } from '@/auth/auth.module';
import { ImageModule } from '@/image/image.module';

@Module({
	imports: [PrismaModule, AuthModule, ImageModule],
	controllers: [PetController],
	providers: [PetService],
})
export class PetModule {}
