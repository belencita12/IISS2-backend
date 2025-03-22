import {
	Injectable,
	CanActivate,
	ExecutionContext,
	ForbiddenException,
} from '@nestjs/common';
import { Role } from '../constants/role.enum';
import { Request } from 'express';
import { TokenPayload } from '@features/auth-module/auth/types/auth.types';
import { PrismaService } from '@features/prisma/prisma.service';

@Injectable()
export class DelImgGuard implements CanActivate {
	constructor(private db: PrismaService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request: Request = context.switchToHttp().getRequest<Request>();
		const user: TokenPayload = request['user'];

		if (user.roles.includes(Role.Admin)) return true;

		const imageId = Number(request.params.id);

		const isClientOwner = await this.db.image.count({
			where: {
				id: imageId,
				petImages: {
					some: { client: { user: { id: user.id } } },
				},
			},
		});

		if (!user.roles.includes(Role.User) || isClientOwner === 0)
			throw new ForbiddenException('No eres dueño de esta imagen');

		return true;
	}
}
