import { RolesGuard } from '@lib/guard/role.guard';
import { applyDecorators, UseGuards } from '@nestjs/common';
import { Roles } from './roles.decorators';
import { Role } from '@lib/constants/role.enum';

export const AdminOnly = (): ClassDecorator =>
	applyDecorators(UseGuards(RolesGuard), Roles(Role.Admin));
