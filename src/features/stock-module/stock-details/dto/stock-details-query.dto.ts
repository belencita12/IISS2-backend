import { PaginationQueryDto } from '@lib/commons/pagination-params.dto';
import {
	IsArray,
	IsEnum,
	IsInt,
	IsNumber,
	IsPositive,
	IsString,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { QueryParam } from '@lib/decorators/validation/query-param.decorator';
import { IsPositiveNumber } from '@lib/decorators/validation/is-money.decorator';
import { Category } from '@prisma/client';

export class StockDetailsQueryDto extends PaginationQueryDto {
	@QueryParam()
	@Type(() => Number)
	@IsNumber()
	stockId?: number;

	@QueryParam()
	@IsString()
	productSearch?: string;

	@QueryParam()
	@Type(() => Number)
	@IsInt()
	@IsPositive()
	fromAmount?: number;

	@QueryParam({ enum: Category })
	@IsEnum(Category)
	category?: Category;

	@QueryParam()
	@Type(() => Number)
	@IsPositiveNumber()
	minCost?: number;

	@QueryParam()
	@Type(() => Number)
	@IsPositiveNumber()
	maxCost?: number;

	@QueryParam()
	@Type(() => Number)
	@IsPositiveNumber()
	minPrice?: number;

	@QueryParam()
	@Type(() => Number)
	@IsPositiveNumber()
	maxPrice?: number;

	@QueryParam()
	@IsArray()
	@IsString({ each: true })
	@Transform(({ value }) =>
		Array.isArray(value) ? value : value.split(',').map((tag) => tag.trim()),
	)
	tags?: string[];

	@Type(() => Number)
	@IsInt()
	@IsPositive()
	@QueryParam()
	toAmount?: number;
}
