import { TokenPayload } from '@features/auth-module/auth/types/auth.types';
import { PrismaService } from '@features/prisma/prisma.service';
import { Request } from 'express';
import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from '@nestjs/common';

@Injectable()
export class IsAppointmentOwnerGuard implements CanActivate {
	constructor(private readonly db: PrismaService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request: Request = context.switchToHttp().getRequest();
		const user: TokenPayload = request['user'];
		const isFromStaff = user.roles.some(
			(r) => r === 'ADMIN' || r === 'EMPLOYEE',
		);

		if (isFromStaff) return true;

		const { id: clientId } = user;
		const isAppExists = await this.db.appointment.isExists({
			id: Number(request.params.id),
			pet: { clientId },
		});

		if (!isAppExists) {
			throw new ForbiddenException(
				'No tiene permiso para acceder a este recurso',
			);
		}

		return true;
	}
}
