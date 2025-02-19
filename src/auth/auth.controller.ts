import {
	Body,
	Controller,
	Post,
	UseGuards,
	Request,
	Get,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignInResponseDto } from './dto/sign-in-res.dto';
import { UserDto } from '@/user/dto/user.dto';
import { AuthGuard } from './guard/auth.guard';
import { Request as Req } from 'express';
import { TokenPayload } from './types/auth.types';
import { ResetPassowrdDto } from './dto/reset-password.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('signup')
	signUp(@Body() dto: SignUpDto) {
		return this.authService.signUp(dto);
	}

	@Post('signin')
	@ApiResponse({ type: SignInResponseDto })
	signIn(@Body() dto: SignInDto) {
		return this.authService.signIn(dto);
	}

	@Post('/token/reset-password')
	@ApiResponse({ status: 201 })
	@ApiBody({ type: ResetPassowrdDto })
	async resetPassword(@Body() dto: ResetPassowrdDto) {
		return await this.authService.generateResetPasswordToken(dto.email);
	}

	@ApiBearerAuth()
	@UseGuards(AuthGuard)
	@Get('me')
	@ApiResponse({ type: UserDto })
	async me(@Request() req: Req) {
		const payload: TokenPayload = req['user'];
		const user = await this.authService.me(payload);
		return new UserDto(user);
	}
}
