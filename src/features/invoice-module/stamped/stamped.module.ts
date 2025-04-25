import { PrismaModule } from '@features/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { StampedController } from './stamped.controller';
import { StampedService } from './stamped.service';

@Module({
	providers: [StampedService],
	controllers: [StampedController],
	imports: [PrismaModule],
})
export class StampedModule {}
