import { PaginationQueryDto } from '@lib/commons/pagination-params.dto';
import { IsTag } from '@lib/decorators/validation/is-tag.decorator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
	IsInt,
	IsNumber,
	IsOptional,
	IsPositive,
	IsString,
} from 'class-validator';

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

	@ApiPropertyOptional()
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@IsPositive()
	minPrice?: number;

	@ApiPropertyOptional()
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@IsPositive()
	maxPrice?: number;

	@ApiPropertyOptional()
	@IsOptional()
	@IsTag()
	tags?: string[];
}
