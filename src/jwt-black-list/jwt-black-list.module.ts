import { Module } from '@nestjs/common';
import { JwtBlackListService } from './jwt-black-list.service';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
	imports: [PrismaModule],
	exports: [JwtBlackListService],
	providers: [JwtBlackListService],
})
export class JwtBlackListModule {}
