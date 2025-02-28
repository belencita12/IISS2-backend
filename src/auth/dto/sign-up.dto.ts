import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class SignUpDto {
	@IsString()
	@ApiProperty()
	fullName: string;

	@IsEmail()
	@ApiProperty()
	email: string;

	@IsString()
	@ApiProperty()
	password: string;
}
