import { ApiProperty } from '@nestjs/swagger';
import { Sex } from '@prisma/client';
import {
	IsString,
	IsNumber,
	IsOptional,
	IsDateString,
	IsPositive,
	IsEnum,
} from 'class-validator';

export class CreatePetDto {
	@IsString()
	@ApiProperty({ example: 'Bruce' })
	name: string;

	@IsNumber()
	@ApiProperty({ example: 1 })
	speciesId: number;

	@IsNumber()
	@ApiProperty({ example: 1 })
	raceId: number;

	@IsNumber()
	@ApiProperty({ example: 1 })
	userId: number;

	@IsNumber()
	@ApiProperty({ example: 12 })
	@IsPositive({ message: 'El peso debe ser un número positivo' })
	weight: number;

	@IsEnum(Sex, { message: 'El sexo debe ser M o F' })
	@ApiProperty({ example: 'M', enum: Sex })
	sex: Sex;

	@IsOptional()
	@ApiProperty({ example: 'https://image.url/profile.jpg' })
	@IsString()
	profileImg?: string;

	@IsDateString()
	@ApiProperty({ example: '2020-05-15T00:00:00.000Z' })
	dateOfBirth: Date;
}
