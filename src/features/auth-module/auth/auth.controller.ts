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
import {
	ApiBearerAuth,
	ApiBody,
	ApiQuery,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignInResponseDto } from './dto/sign-in-res.dto';
import { AuthGuard } from './guard/auth.guard';
import { Request as Req } from 'express';
import { TokenPayload } from './types/auth.types';
import { ResetPassTokenDto, ResetPasswordDto } from './dto/reset-password.dto';
import { RegisterClientDto } from './dto/register-client.dto';
import { Public } from '@lib/decorators/public.decorator';
import { UserDto } from '@features/auth-module/user/dto/user.dto';
import { Role } from '@lib/constants/role.enum';
import { Roles } from '@lib/decorators/roles.decorators';
import { RolesGuard } from '@lib/guard/role.guard';

@ApiTags('Auth')
@ApiBearerAuth('access-token')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Public()
	@Post('signup')
	signUp(@Body() dto: SignUpDto) {
		return this.authService.signUp(dto);
	}

	@Post('/admin/signup')
	@UseGuards(RolesGuard)
	@Roles(Role.Admin)
	registerClient(@Body() dto: RegisterClientDto) {
		return this.authService.registerClient(dto);
	}

	@Public()
	@Post('signin')
	@ApiResponse({ type: SignInResponseDto })
	signIn(@Body() dto: SignInDto) {
		return this.authService.signIn(dto);
	}

	@Public()
	@Post('/token/reset-password')
	@HttpCode(200)
	@ApiResponse({ status: 200 })
	@ApiBody({ type: ResetPassTokenDto })
	async getResetPassToken(@Body() dto: ResetPassTokenDto) {
		return await this.authService.getResetPassToken(dto.email);
	}

	@Public()
	@Put('/reset-password')
	@ApiBody({ type: ResetPasswordDto })
	@ApiQuery({ name: 'token', type: String })
	async resetPassword(
		@Query('token') token: string,
		@Body() dto: ResetPasswordDto,
	) {
		return await this.authService.resetPassword(token, dto.password);
	}

	@ApiBearerAuth()
	@UseGuards(AuthGuard)
	@Get('me')
	@ApiResponse({ type: UserDto })
	async me(@Request() req: Req) {
		const payload: TokenPayload = req['user'];
		return await this.authService.me(payload);
	}
}
