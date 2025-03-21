import { PaginationQueryDto } from '@lib/commons/pagination-params.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Category } from '@prisma/client';
import { Type } from 'class-transformer';
import {
	IsEnum,
	IsNumber,
	IsOptional,
	IsPositive,
	IsString,
} from 'class-validator';

export class ProductQueryDto extends PaginationQueryDto {
	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	name?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	code?: string;

	@ApiPropertyOptional({ enum: Category })
	@IsOptional()
	@IsEnum(Category)
	category?: Category;

	@ApiPropertyOptional()
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@IsPositive()
	minCost?: number;

	@ApiPropertyOptional()
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@IsPositive()
	maxCost?: number;

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
}
