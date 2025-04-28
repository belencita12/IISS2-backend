import { IsRuc } from '@lib/decorators/validation/is-ruc';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsEmail,
	IsOptional,
	IsPhoneNumber,
	IsString,
	MinLength,
} from 'class-validator';

export class CreateUserDto {
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

	@ApiProperty()
	@IsRuc()
	ruc: string;

	@IsString({ each: true })
	@IsOptional()
	roles?: string[];

	@IsString()
	@MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
	@ApiProperty()
	password: string;
}
