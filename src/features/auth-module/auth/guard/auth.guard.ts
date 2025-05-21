import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { TokenPayload } from '../types/auth.types';
import { Reflector } from '@nestjs/core';
import { EnvService } from '@features/global-module/env/env.service';
import { UserService } from '@features/auth-module/user/user.service';
import { IS_PUBLIC_KEY } from '@lib/decorators/auth/public.decorator';
@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		private jwtService: JwtService,
		private userService: UserService,
		private env: EnvService,
		private reflector: Reflector,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request: Request = context.switchToHttp().getRequest();
		const token = this.extractTokenFromHeader(request);
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		if (token) {
			try {
				const payload: TokenPayload = await this.jwtService.verifyAsync(token, {
					secret: this.env.get('JWT_SECRET'),
				});
				const user = await this.userService.findOne(payload.id);
				if (!user || user.deletedAt) throw new UnauthorizedException();

				request['user'] = payload;
			} catch {
				throw new UnauthorizedException();
			}
		}

		if (!token && !isPublic) throw new UnauthorizedException();

		return true;
	}

	private extractTokenFromHeader(request: Request): string | undefined {
		const [type, token] = request.headers.authorization?.split(' ') ?? [];
		return type === 'Bearer' ? token : undefined;
	}
}
