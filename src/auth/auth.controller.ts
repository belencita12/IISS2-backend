import {
	Body,
	Controller,
	Post,
	UseGuards,
	Request,
	Get,
	HttpCode,
	Query,
	Put,
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
import { ResetPassTokenDto, ResetPasswordDto } from './dto/reset-password.dto';

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
	@HttpCode(200)
	@ApiResponse({ status: 200 })
	@ApiBody({ type: ResetPassTokenDto })
	async getResetPassToken(@Body() dto: ResetPassTokenDto) {
		return await this.authService.getResetPassToken(dto.email);
	}

	@Put('/reset-password')
	@ApiBody({ type: ResetPasswordDto })
	async resetPassword(@Query() token: string, @Body() dto: ResetPasswordDto) {
		return await this.authService.resetPassword(token, dto.password);
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
