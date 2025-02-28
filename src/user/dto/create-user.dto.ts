import { CreatePetDto } from '@/pet/dto/create-pet.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';

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
	@MinLength(8)
	@ApiProperty()
	password: string;


	@IsArray()
	@IsOptional()
	@ValidateNested({ each: true })
	@Type(() => CreatePetDto) 
	pets?: CreatePetDto[]; 
}
