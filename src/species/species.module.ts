import { Module } from '@nestjs/common';
import { SpeciesService } from './species.service';
import { SpeciesController } from './species.controller';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
	imports: [PrismaModule],
	controllers: [SpeciesController],
	providers: [SpeciesService],
})
export class SpeciesModule {}
