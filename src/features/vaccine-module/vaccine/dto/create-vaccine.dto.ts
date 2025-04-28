import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDefined, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateVaccineDto {
	@ApiProperty({ example: 1, required: true })
	@Transform(({ value }) => Number(value))
	@IsNumber()
	@IsDefined()
	speciesId: number;

	@ApiProperty({ example: 'Vacuna X', required: true })
	@IsString()
	@IsDefined()
	name: string;

	@IsString()
	@ApiProperty({ example: 'Descripcion Vacuna X' })
	description: string;

	@ApiProperty({ example: 5, required: true })
	@Transform(({ value }) => Number(value))
	@IsNumber()
	@IsDefined()
	manufacturerId: number;

	@ApiProperty({ example: 10000 })
	@Transform(({ value }) => Number(value))
	@IsNumber()
	cost: number;

	@ApiProperty({ example: 0.1 })
	@Transform(({ value }) => Number(value))
	@IsNumber()
	iva: number;

	@ApiProperty({ example: 40000 })
	@Transform(({ value }) => Number(value))
	@IsNumber()
	price: number;

	@ApiPropertyOptional({ type: 'string', format: 'binary' })
	@IsOptional()
	productImg?: Express.Multer.File;
}
