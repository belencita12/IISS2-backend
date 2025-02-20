import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class ResetPassTokenDto {
	@IsEmail()
	@ApiProperty()
	email: string;
}

export class ResetPasswordDto {
	@IsString()
	@ApiProperty()
	password: string;
}
