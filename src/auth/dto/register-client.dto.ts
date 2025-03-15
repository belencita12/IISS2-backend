import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class RegisterClientDto {
	@IsString()
	@ApiProperty()
	fullName: string;

	@IsEmail()
	@ApiProperty()
	email: string;
}
