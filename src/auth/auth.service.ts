import { UserService } from '@/user/user.service';
import { HttpException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { compare } from '@/lib/utils/encrypt';
import { ResetPassTokenPayload, TokenPayload } from './types/auth.types';
import { EmailService } from '@/email/email.service';
import { EnvService } from '@/env/env.service';
import { JwtBlackListService } from '@/jwt-black-list/jwt-black-list.service';
import { getPassResetTemplate } from '@/email/templates/pass-reset';
import { SignInResponseDto } from './dto/sign-in-res.dto';

@Injectable()
export class AuthService {
	constructor(
		private env: EnvService,
		private emailService: EmailService,
		private jwtBlackListService: JwtBlackListService,
		private usersService: UserService,
		private jwt: JwtService,
	) {}

	async signUp(dto: SignUpDto) {
		await this.usersService.create(dto);
	}

	async signIn(dto: SignInDto): Promise<SignInResponseDto> {
		const user = await this.usersService.findByEmail(dto.email);
		if (!user) throw new HttpException('Email or password is incorrect', 401);
		const match = await compare(dto.password, user.password);
		if (!match) throw new HttpException('Email or password is incorrect', 401);
		const roles = user.roles.map((r) => r.name);
		const payload: TokenPayload = {
			id: user.id,
			username: user.username,
			email: user.email,
			roles: user.roles.map((role) => role.name),
		};
		return {
			id: user.id,
			fullName: user.fullName,
			token: this.jwt.sign(payload),
			username: user.username,
			roles,
		};
	}

	async me(user: TokenPayload) {
		const userDB = await this.usersService.findOne(user.id);
		if (!userDB) throw new HttpException('User not found', 404);
		return userDB;
	}

	async getResetPassToken(email: string) {
		const user = await this.usersService.findByEmail(email);
		if (!user) throw new HttpException('Email is incorrect', 401);
		const payload: ResetPassTokenPayload = { id: user.id };
		const token = this.jwt.sign(payload, {
			secret: this.env.get('JWT_RESET_PASS_SECRET'),
			expiresIn: this.env.get('JWT_RESET_PASS_EXP'),
		});
		const host = this.env.get('FE_HOST');
		const link = `${host}/reset-password?token=${token}`;
		const message = getPassResetTemplate({
			link,
			username: user.username,
		});
		this.emailService.sendEmail({
			to: user.email,
			subject: 'Password reset',
			content: message,
			type: 'html',
		});
	}

	async resetPassword(token: string, password: string) {
		await this.jwtBlackListService.isJwtBanned(token);
		const payload: ResetPassTokenPayload = this.jwt.verify(token, {
			secret: this.env.get('JWT_RESET_PASS_SECRET'),
		});
		await this.jwtBlackListService.addJwtToBlackList(token);
		await this.usersService.update(payload.id, { password });
	}
}
