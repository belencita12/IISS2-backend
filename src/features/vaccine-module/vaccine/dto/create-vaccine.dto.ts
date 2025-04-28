import { IsIVA } from '@lib/decorators/validation/is-iva';
import { IsPositiveNumber } from '@lib/decorators/validation/is-money.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDefined, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { IsId } from '@lib/decorators/validation/is-id.decorator';

export class CreateVaccineDto {
	@ApiProperty({ example: 1 })
	@Type(() => Number)
	speciesId: number;

	@ApiProperty({ example: 'Vacuna X' })
	@IsString()
	@IsDefined()
	name: string;

	@ApiProperty({ example: 5 })
	@Type(() => Number)
	@IsIVA()
	manufacturerId: number;

	@ApiProperty({ example: 10000 })
	@Type(() => Number)
	@IsPositiveNumber()
	cost: number;

	@ApiProperty({ example: 10 })
	@Type(() => Number)
	@IsIVA()
	iva: number;

	@ApiProperty()
	@Type(() => Number)
	@IsId()
	providerId: number;

	@ApiProperty({ example: 40000 })
	@Type(() => Number)
	@IsPositiveNumber()
	price: number;

	@ApiPropertyOptional({ type: 'string', format: 'binary' })
	@IsOptional()
	productImg?: Express.Multer.File;
}
