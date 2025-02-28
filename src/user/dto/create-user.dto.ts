import { ApiProperty } from '@nestjs/swagger';
import {
	IsArray,
	IsEmail,
	IsOptional,
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

	@IsString()
	@IsArray({ each: true })
	@IsOptional()
	roles?: string[];

	@IsString()
	@MinLength(8)
	@ApiProperty()
	password: string;
}
