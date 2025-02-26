import { Module } from '@nestjs/common';
import { SpeciesService } from './species.service';
import { SpeciesController } from './species.controller';
import { PrismaService } from '@/prisma.service';

@Module({
  controllers: [SpeciesController],
  providers: [SpeciesService,PrismaService],
})
export class SpeciesModule {}
