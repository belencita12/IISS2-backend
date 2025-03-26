import { HttpException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { ResetPassTokenPayload, TokenPayload } from './types/auth.types';
import { SignInResponseDto } from './dto/sign-in-res.dto';
import { RegisterClientDto } from './dto/register-client.dto';
import { EnvService } from '../../global-module/env/env.service';
import { EmailService } from '@features/global-module/email/email.service';
import { JwtBlackListService } from '@features/auth-module/jwt-black-list/jwt-black-list.service';
import { UserService } from '@features/auth-module/user/user.service';
import { compare, genPassword } from '@lib/utils/encrypt';
import { getPassResetTemplate } from '@features/global-module/email/templates/pass-reset';
import { ClientService } from '@features/client/client.service';

@Injectable()
export class AuthService {
	constructor(
		private env: EnvService,
		private emailService: EmailService,
		private jwtBlackListService: JwtBlackListService,
		private usersService: UserService,
		private clientService: ClientService,
		private jwt: JwtService,
	) {}

	async signUp(dto: SignUpDto) {
		await this.clientService.create(dto);
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
			employeeId: user.employee?.id,
			clientId: user.client?.id,
		};
		return {
			id: user.id,
			fullName: user.fullName,
			token: this.jwt.sign(payload),
			username: user.username,
			employeeId: user.employee?.id,
			clientId: user.client?.id,
			roles,
		};
	}

	async me(user: TokenPayload) {
		const userDB = await this.usersService.findOne(user.id);
		if (!userDB) throw new HttpException('User not found', 404);
		return userDB;
	}

	async registerClient(dto: RegisterClientDto) {
		const password = await genPassword();
		await this.clientService.create({ ...dto, password });
		await this.getResetPassToken(dto.email);
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
