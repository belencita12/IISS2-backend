import { CreateProductDto } from '@/product/dto/create-product.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';

export class CreateVaccineDto {
	@ApiProperty({ example: 1 })
	@IsInt()
	speciesId: number;

	@ApiProperty({ example: 'Vacuna X' })
	@IsString()
	name: string;

	@ApiProperty({ example: 5 })
	@IsInt()
	manufacturerId: number;

	@ApiPropertyOptional({ type: CreateProductDto })
	@ValidateNested()
	@Type(() => CreateProductDto)
	@IsOptional()
	productData?: CreateProductDto;
}
