import { Module } from '@nestjs/common';
import { PetService } from './pet.service';
import { PetController } from './pet.controller';
import { ImageModule } from '@features/media-module/image/image.module';
import { PrismaModule } from '@features/prisma/prisma.module';
import { PetReport } from './pet.report';

@Module({
	imports: [PrismaModule, ImageModule],
	providers: [PetService, PetReport],
	controllers: [PetController],
})
export class PetModule {}
