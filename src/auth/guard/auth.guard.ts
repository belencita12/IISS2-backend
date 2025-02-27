import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { TokenPayload } from '../types/auth.types';
import { EnvService } from '@/env/env.service';
import { UserService } from '@/user/user.service';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '@/lib/decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		private jwtService: JwtService,
		private userService: UserService,
		private env: EnvService,
		private reflector: Reflector,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY,[
			context.getHandler(),
			context.getClass(),
		])
	
		if(isPublic){
			return true;
		}

		const request: Request = context.switchToHttp().getRequest();
		const token = this.extractTokenFromHeader(request);
		const secret = this.env.get('JWT_SECRET');

		if (!token) {
			throw new UnauthorizedException();
		}
		
		try {
			const payload: TokenPayload = await this.jwtService.verifyAsync(token, {
				secret,
				
			});

			const user = await this.userService.findOne(payload.id);
			if (!user || user.deletedAt) throw new UnauthorizedException();
			request['user'] = payload;
		} catch {
			throw new UnauthorizedException();
		}
		return true;
	}

	private extractTokenFromHeader(request: Request): string | undefined {
		const [type, token] = request.headers.authorization?.split(' ') ?? [];
		return type === 'Bearer' ? token : undefined;
	}
}
