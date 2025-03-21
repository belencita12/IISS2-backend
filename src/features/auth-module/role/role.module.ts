import { Module } from '@nestjs/common';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from '@features/prisma/prisma.module';
import { RolesGuard } from '@lib/guard/role.guard';

@Module({
	imports: [PrismaModule],
	providers: [
		RoleService,
		{
			provide: APP_GUARD,
			useClass: RolesGuard,
		},
	],
	controllers: [RoleController],
})
export class RoleModule {}
