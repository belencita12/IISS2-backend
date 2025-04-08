import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsPhoneNumber } from 'class-validator';

export class RegisterClientDto {
	@IsString()
	@ApiProperty()
	fullName: string;

	@IsString()
	@IsEmail()
	@ApiProperty()
	email: string;

	@IsOptional()
	@IsString()
	@ApiPropertyOptional()
	adress?: string;

	@IsPhoneNumber()
	@ApiProperty()
	phoneNumber: string;

	@IsString()
	@ApiProperty()
	ruc: string;

	@IsString({ each: true })
	@IsOptional()
	roles: string[] = ['USER'];
}
