import { CreateProductDto } from '@/product/dto/create-product.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsDateString, IsOptional, ValidateNested } from 'class-validator';

export class VaccineDto {
	@ApiProperty({ example: 1 })
	id: number;

	@ApiProperty({ example: 1 })
	speciesId: number;

	@ApiProperty({ example: 'Vacuna X' })
	name: string;

	@ApiPropertyOptional({ type: CreateProductDto })
	@ValidateNested()
	@Type(() => CreateProductDto)
	productData?: CreateProductDto;

	@ApiProperty({ example: 1 })
	manufacturerId: number;

	@Expose()
	@IsDateString()
	@ApiProperty()
	createdAt: Date;

	@Expose()
	@IsDateString()
	@ApiProperty()
	updatedAt: Date;

	@Expose()
	@IsOptional()
	@IsDateString()
	@ApiPropertyOptional()
	deletedAt: Date | null;

	constructor(partial: Partial<VaccineDto>) {
		Object.assign(this, partial);
	}
}
