import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../constants/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorators';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
			context.getHandler(),
			context.getClass(),
		]);
		if (!requiredRoles) {
			return true;
		}
		const { user } = context.switchToHttp().getRequest();
		if (!user) {
			console.error('No se encontró un usuario en la solicitud');
			return false;
		}
		return requiredRoles.some((role) => user.roles?.includes(role));
	}
}
