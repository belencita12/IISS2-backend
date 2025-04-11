import { PaginationQueryDto } from '@lib/commons/pagination-params.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsOptional, IsString } from 'class-validator';

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

	@IsOptional()
	@IsDateString()
	@ApiPropertyOptional()
	fromIssueDate?: Date;

	@IsOptional()
	@IsDateString()
	@ApiPropertyOptional()
	toIssueDate?: Date;
}
