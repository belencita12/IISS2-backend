import {
	CanActivate,
	ExecutionContext,
	Injectable,
	ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '@features/prisma/prisma.service';
import { Request } from 'express';
import { RESOURCE_KEY } from '@lib/decorators/resource.decorator';

@Injectable()
export class IsOwnerGuard implements CanActivate {
	constructor(
		private prisma: PrismaService,
		private reflector: Reflector,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request: Request = context.switchToHttp().getRequest();
		const user = request['user'];

		if (!user) {
			throw new ForbiddenException('Usuario no autenticado');
		}

		const userRoles = Array.isArray(user.roles) ? user.roles : [];
		if (userRoles.includes('admin')) {
			return true;
		}

		const model = this.reflector.get<string>(
			RESOURCE_KEY,
			context.getHandler(),
		);

		if (!model) {
			throw new ForbiddenException('Modelo no definido en el guard');
		}

		let resourceId = request.params.id || request.body.id;

		if (!resourceId) {
			throw new ForbiddenException('ID del recurso no especificado');
		}

		resourceId = Number(resourceId);
		if (isNaN(resourceId)) {
			throw new ForbiddenException('ID del recurso inválido');
		}

		const resource = await this.prisma[model].findFirst({
			where: {
				id: resourceId,
				clientId: user.clientId,
				deletedAt: null,
			},
			select: {
				id: true,
			},
		});

		if (!resource) {
			throw new ForbiddenException(
				'No tienes permiso para acceder a este recurso',
			);
		}

		return true;
	}
}
