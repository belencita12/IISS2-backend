import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class SignUpDto {
	@IsString()
	@ApiProperty()
	username: string;

	@IsEmail()
	@ApiProperty()
	email: string;

	@IsString()
	@ApiProperty()
	password: string;
}
