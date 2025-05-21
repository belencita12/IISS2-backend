import { PaginationQueryDto } from '@lib/commons/pagination-params.dto';
import { IsId } from '@lib/decorators/validation/is-id.decorator';
import { IsPositiveNumber } from '@lib/decorators/validation/is-money.decorator';
import { QueryParam } from '@lib/decorators/validation/query-param.decorator';
import { ToBoolean } from '@lib/decorators/validation/to-boolean.decorator';
import { Type } from 'class-transformer';
import { IsBoolean } from 'class-validator';

export class ProductCostQueryDto extends PaginationQueryDto {
	@IsId()
	@Type(() => Number)
	@QueryParam()
	productId: number;

	@ToBoolean()
	@IsBoolean()
	@QueryParam()
	isActive: boolean;

	@Type(() => Number)
	@IsPositiveNumber()
	@QueryParam()
	fromCost: number;

	@Type(() => Number)
	@IsPositiveNumber()
	@QueryParam()
	toCost: number;
}
