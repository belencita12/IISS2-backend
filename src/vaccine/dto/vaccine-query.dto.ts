import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '@/lib/commons/pagination-params.dto';

export class VaccineQueryDto extends PaginationQueryDto {
	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	speciesId?: number;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	name?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	productId?: number;

	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	manufacturerId?: number;
}
