import { PaginationQueryDto } from '@lib/commons/pagination-params.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class ServiceTypeQueryDto extends PaginationQueryDto {
	@IsOptional()
	@IsString()
	@ApiPropertyOptional()
	name?: string;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@ApiPropertyOptional()
	fromDuration?: number;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@ApiPropertyOptional()
	toDuration?: number;
}
