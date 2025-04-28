import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateVaccineDto {
	@ApiProperty({ example: 1 })
	@Transform(({ value }) => Number(value))
	@IsNumber()
	@IsOptional()
	speciesId?: number;

	@ApiProperty({ example: 'Vacuna X' })
	@IsString()
	@IsOptional()
	name?: string;

	@IsString()
	@ApiProperty({ example: 'Descripcion Vacuna X' })
	description: string;

	@ApiProperty({ example: 5 })
	@Transform(({ value }) => Number(value))
	@IsNumber()
	@IsOptional()
	manufacturerId?: number;

	@ApiProperty({ example: 10000 })
	@Transform(({ value }) => Number(value))
	@IsNumber()
	@IsOptional()
	cost?: number;

	@ApiProperty({ example: 0.1 })
	@Transform(({ value }) => Number(value))
	@IsNumber()
	@IsOptional()
	iva?: number;

	@ApiProperty({ example: 40000 })
	@Transform(({ value }) => Number(value))
	@IsNumber()
	@IsOptional()
	price?: number;

	@ApiPropertyOptional({ type: 'string', format: 'binary' })
	@IsOptional()
	productImg?: Express.Multer.File;
}
