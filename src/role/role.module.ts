import { Module } from '@nestjs/common';
import { RoleController } from './role.controller';
import { PrismaService } from '@/prisma.service';
import { RoleService } from './role.service';

@Module({
	providers: [PrismaService, RoleService],
	controllers: [RoleController],
})
export class RoleModule {}
