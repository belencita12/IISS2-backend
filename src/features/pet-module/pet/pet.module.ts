import { Module } from '@nestjs/common';
import { PetService } from './pet.service';
import { PetController } from './pet.controller';
import { AuthModule } from '@features/auth-module/auth/auth.module';
import { ImageModule } from '@features/media-module/image/image.module';
import { PrismaModule } from '@features/prisma/prisma.module';

@Module({
	imports: [PrismaModule, AuthModule, ImageModule],
	controllers: [PetController],
	providers: [PetService],
})
export class PetModule {}
