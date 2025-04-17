import { PaginationQueryDto } from '@lib/commons/pagination-params.dto';
import { IsDbDate } from '@lib/decorators/validation/is-db-date.decorator';
import { IsId } from '@lib/decorators/validation/is-id.decorator';
import { InvoiceType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum } from 'class-validator';
import { QueryParam } from '../../../lib/decorators/validation/query-param.decorator';

export class InvoiceQueryDto extends PaginationQueryDto {
	@QueryParam()
	ruc?: string;

	@Type(() => Number)
	@IsId()
	@QueryParam()
	stockId?: number;

	@Type(() => Number)
	@QueryParam()
	fromTotal?: number;

	@Type(() => Number)
	@QueryParam()
	toTotal?: number;

	@IsEnum(InvoiceType)
	@QueryParam({ enum: InvoiceType })
	type?: InvoiceType;

	@IsDbDate()
	@QueryParam()
	fromIssueDate?: string;

	@IsDbDate()
	@QueryParam()
	toIssueDate?: string;
}
