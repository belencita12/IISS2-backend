import { IsOptional, IsInt, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '@/lib/commons/pagination-params.dto';

export class VaccineBatchQueryDto extends PaginationQueryDto {
	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	code?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	manufacturerId?: number;

	@ApiPropertyOptional()
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	vaccineId?: number;
}
