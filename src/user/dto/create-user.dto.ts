import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsOptional, IsString, Min } from 'class-validator';

export class CreateUserDto {
	@IsString()
	@ApiProperty()
	username: string;

	@IsString()
	@IsEmail()
	@ApiProperty()
	email: string;

	@IsString()
	@IsArray({ each: true })
	@IsOptional()
	roles?: string[];

	@IsString()
	@Min(8)
	@ApiProperty()
	password: string;
}
