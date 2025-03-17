import { PaginationQueryDto } from '@/lib/commons/pagination-params.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class VaccineRegistryQueryDto extends PaginationQueryDto {
	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	name?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	vaccineId?: number;

	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	petId?: number;

	@ApiPropertyOptional()
	@IsOptional() // Añadido @IsOptional()
	@IsNumber()
	@Type(() => Number)
	dose?: number;

	@ApiPropertyOptional()
	@IsOptional()
	@IsDateString()
	applicationDate?: Date;

	@ApiPropertyOptional()
	@IsOptional()
	@IsDateString()
	expectedDate?: Date;
}
