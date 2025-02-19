import { Module } from '@nestjs/common';
import { JwtBlackListService } from './jwt-black-list.service';
import { PrismaService } from '@/prisma.service';

@Module({
	exports: [JwtBlackListService],
	providers: [JwtBlackListService, PrismaService],
})
export class JwtBlackListModule {}
