import { IsOptional, IsInt, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '@/lib/commons/pagination-params.dto';

export class VaccineQueryDto extends PaginationQueryDto {
	@ApiPropertyOptional()
	@Type(() => Number)
	@IsInt()
	speciesId?: number;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	name?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	productId?: number;

	@ApiPropertyOptional()
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	manufacturerId?: number;
}
