import { PrismaModule } from '@features/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { StampedController } from './stamped.controller';
import { StampedService } from './stamped.service';

@Module({
	imports: [PrismaModule],
	providers: [StampedService],
	exports: [StampedService],
	controllers: [StampedController],
})
export class StampedModule {}
