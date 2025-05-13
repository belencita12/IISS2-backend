import { PaginationQueryDto } from '@lib/commons/pagination-params.dto';
import { IsDbDate } from '@lib/decorators/validation/is-db-date.decorator';
import { IsId } from '@lib/decorators/validation/is-id.decorator';
import { IsPositiveNumber } from '@lib/decorators/validation/is-money.decorator';
import { QueryParam } from '@lib/decorators/validation/query-param.decorator';
import { Type } from 'class-transformer';
import { IsString } from 'class-validator';

export class ReceiptQueryDto extends PaginationQueryDto {
	@QueryParam({ description: 'Invoice Number - Client Name - Client Ruc' })
	@IsString()
	searchTerm?: string;

	@Type(() => Number)
	@IsPositiveNumber()
	@QueryParam()
	receiptNumber?: number;

	@Type(() => Number)
	@QueryParam()
	@IsId()
	paymentMethodId?: number;

	@IsDbDate()
	@QueryParam()
	fromIssueDate?: string;

	@IsDbDate()
	@QueryParam()
	toIssueDate?: string;

	@Type(() => Number)
	@QueryParam()
	@IsPositiveNumber()
	fromTotal?: number;

	@Type(() => Number)
	@QueryParam()
	@IsPositiveNumber()
	toTotal?: number;
}
