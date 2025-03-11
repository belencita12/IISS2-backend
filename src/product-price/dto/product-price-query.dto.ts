import { PaginationQueryDto } from '@/lib/commons/pagination-params.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
	IsBooleanString,
	IsInt,
	IsNumber,
	IsOptional,
	IsPositive,
} from 'class-validator';

export class ProductPriceQueryDto extends PaginationQueryDto {
	@IsBooleanString()
	@IsOptional()
	@ApiPropertyOptional()
	active?: boolean;

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@ApiPropertyOptional()
	fromAmount?: number;

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@ApiPropertyOptional()
	toAmount?: number;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@IsPositive()
	@ApiPropertyOptional()
	productId?: number;
}
