import { PaginationQueryDto } from '@lib/commons/pagination-params.dto';
import { IsDbDate } from '@lib/decorators/validation/is-db-date.decorator';
import { QueryParam } from '@lib/decorators/validation/query-param.decorator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class InvoiceDetailQueryDto extends PaginationQueryDto {
	@IsOptional()
	@IsString()
	@ApiPropertyOptional()
	invoiceNumber?: string;

	@IsOptional()
	@Type(() => Number)
	@ApiPropertyOptional()
	fromPartialTotal?: number;

	@IsOptional()
	@Type(() => Number)
	@ApiPropertyOptional()
	toPartialTotal?: number;

	@QueryParam()
	@IsDbDate()
	fromIssueDate?: string;

	@QueryParam()
	@IsDbDate()
	toIssueDate?: string;
}
