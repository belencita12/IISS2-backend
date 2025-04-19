import { PaginationQueryDto } from '@lib/commons/pagination-params.dto';
import { IsId } from '@lib/decorators/validation/is-id.decorator';
import { IsPositiveNumber } from '@lib/decorators/validation/is-money.decorator';
import { QueryParam } from '@lib/decorators/validation/query-param.decorator';

export class ReceiptQueryDto extends PaginationQueryDto {
	@QueryParam()
	@IsId()
	invoiceId?: number;

	@QueryParam()
	@IsPositiveNumber()
	fromTotal?: number;

	@QueryParam()
	@IsPositiveNumber()
	toTotal?: number;
}
