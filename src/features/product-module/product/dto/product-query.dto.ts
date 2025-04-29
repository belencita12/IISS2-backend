import { PaginationQueryDto } from '@lib/commons/pagination-params.dto';
import { Category } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsString, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsId } from '@lib/decorators/validation/is-id.decorator';
import { QueryParam } from '@lib/decorators/validation/query-param.decorator';
import { IsPositiveNumber } from '@lib/decorators/validation/is-money.decorator';

export class ProductQueryDto extends PaginationQueryDto {
	@QueryParam()
	@IsString()
	name?: string;

	@QueryParam()
	@IsString()
	code?: string;

	@Type(() => Number)
	@QueryParam()
	@IsId()
	providerId?: number;

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
	@QueryParam()
	@IsId('El identificador del deposito')
	stockId?: number;
}
