import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Sex } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
	IsString,
	IsNumber,
	IsDateString,
	IsPositive,
	IsEnum,
} from 'class-validator';

export class CreatePetDto {
	@IsString()
	@ApiProperty({ example: 'Bruce' })
	name: string;

	@Transform(({ value }) => Number(value))
	@IsNumber()
	@ApiProperty({ example: 1 })
	speciesId: number;

	@Transform(({ value }) => Number(value))
	@IsNumber()
	@ApiProperty({ example: 1 })
	raceId: number;

	@Transform(({ value }) => Number(value))
	@IsNumber()
	@ApiProperty({ example: 1 })
	userId: number;

	@Transform(({ value }) => Number(value))
	@IsNumber()
	@ApiProperty({ example: 12 })
	@IsPositive({ message: 'El peso debe ser un número positivo' })
	weight: number;

	@IsEnum(Sex, { message: 'El sexo debe ser M o F' })
	@ApiProperty({ example: 'M', enum: Sex })
	sex: Sex;

	@IsDateString()
	@ApiProperty({ example: '2020-05-15T00:00:00.000Z' })
	dateOfBirth: Date;

	@ApiPropertyOptional({ type: 'string', format: 'binary' })
	profileImg?: Express.Multer.File;
}
