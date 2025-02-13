import { UserService } from '@/user/user.service';
import { HttpException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { compare } from '@/lib/utils/encrypt';
import { TokenPayload } from './types/auth.types';

@Injectable()
export class AuthService {
	constructor(
		private usersService: UserService,
		private jwt: JwtService,
	) {}

	async signUp(dto: SignUpDto) {
		await this.usersService.create(dto);
	}

	async signIn(dto: SignInDto) {
		const user = await this.usersService.findByEmail(dto.email);
		if (!user) throw new HttpException('Email or password is incorrect', 401);
		const match = await compare(dto.password, user.password);
		if (!match) throw new HttpException('Email or password is incorrect', 401);
		const roles = user.roles.map((r) => r.name);
		const payload: TokenPayload = {
			id: user.id,
			username: user.username,
			email: user.email,
		};
		return { token: this.jwt.sign(payload), username: user.username, roles };
	}

	async me(user: TokenPayload) {
		const userDB = await this.usersService.findOne(user.id);
		if (!userDB) throw new HttpException('User not found', 404);
		return userDB;
	}
}
