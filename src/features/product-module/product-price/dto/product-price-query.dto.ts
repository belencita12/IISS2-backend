import { PaginationQueryDto } from '@lib/commons/pagination-params.dto';
import { IsId } from '@lib/decorators/validation/is-id.decorator';
import { IsPositiveNumber } from '@lib/decorators/validation/is-money.decorator';
import { QueryParam } from '@lib/decorators/validation/query-param.decorator';
import { ToBoolean } from '@lib/decorators/validation/to-boolean.decorator';
import { Type } from 'class-transformer';
import { IsBoolean } from 'class-validator';

export class ProductPriceQueryDto extends PaginationQueryDto {
	@ToBoolean()
	@IsBoolean()
	@QueryParam()
	active?: boolean;

	@Type(() => Number)
	@IsPositiveNumber()
	@QueryParam()
	fromAmount?: number;

	@Type(() => Number)
	@IsPositiveNumber()
	@QueryParam()
	toAmount?: number;

	@Type(() => Number)
	@IsId()
	@QueryParam()
	productId?: number;
}
