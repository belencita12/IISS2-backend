import { Module } from '@nestjs/common';
import { RaceService } from './race.service';
import { RaceController } from './race.controller';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
	imports: [PrismaModule],
	controllers: [RaceController],
	providers: [RaceService],
})
export class RaceModule {}
