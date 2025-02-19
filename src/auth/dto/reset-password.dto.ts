import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ResetPassowrdDto {
	@IsEmail()
	@ApiProperty()
	email: string;
}
