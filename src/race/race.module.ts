import { Module } from '@nestjs/common';
import { RaceService } from './race.service';
import { RaceController } from './race.controller';
import { PrismaService } from '@/prisma.service';

@Module({
  controllers: [RaceController],
  providers: [RaceService, PrismaService],
})
export class RaceModule {}
