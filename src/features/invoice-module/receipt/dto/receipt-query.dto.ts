import { PaginationQueryDto } from '@lib/commons/pagination-params.dto';
import { IsId } from '@lib/decorators/validation/is-id.decorator';
import { IsPositiveNumber } from '@lib/decorators/validation/is-money.decorator';
import { QueryParam } from '@lib/decorators/validation/query-param.decorator';
import { Type } from 'class-transformer';

export class ReceiptQueryDto extends PaginationQueryDto {
	@Type(() => Number)
	@QueryParam()
	@IsId()
	invoiceId?: number;

	@Type(() => Number)
	@QueryParam()
	@IsPositiveNumber()
	fromTotal?: number;

	@Type(() => Number)
	@QueryParam()
	@IsPositiveNumber()
	toTotal?: number;
}
