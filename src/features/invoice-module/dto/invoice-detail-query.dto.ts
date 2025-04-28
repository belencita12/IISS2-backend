import { PaginationQueryDto } from '@lib/commons/pagination-params.dto';
import { IsDbDate } from '@lib/decorators/validation/is-db-date.decorator';
import { IsId } from '@lib/decorators/validation/is-id.decorator';
import { QueryParam } from '@lib/decorators/validation/query-param.decorator';
import { Type } from 'class-transformer';

export class InvoiceDetailQueryDto extends PaginationQueryDto {
	@Type(() => Number)
	@QueryParam()
	@IsId()
	invoiceId?: number;

	@QueryParam()
	@Type(() => Number)
	fromPartialTotal?: number;

	@QueryParam()
	@Type(() => Number)
	toPartialTotal?: number;

	@QueryParam()
	@IsDbDate()
	fromIssueDate?: string;

	@QueryParam()
	@IsDbDate()
	toIssueDate?: string;
}
