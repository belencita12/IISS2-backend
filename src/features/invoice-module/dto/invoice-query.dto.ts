import { PaginationQueryDto } from '@lib/commons/pagination-params.dto';
import { IsId } from '@lib/decorators/validation/is-id.decorator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { InvoiceType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';

export class InvoiceQueryDto extends PaginationQueryDto {
	@IsOptional()
	@ApiPropertyOptional()
	ruc?: string;

	@IsOptional()
	@Type(() => Number)
	@IsId()
	@ApiPropertyOptional()
	stockId?: number;

	@IsOptional()
	@Type(() => Number)
	@ApiPropertyOptional()
	fromTotal?: number;

	@IsOptional()
	@Type(() => Number)
	@ApiPropertyOptional()
	toTotal?: number;

	@IsOptional()
	@IsEnum(InvoiceType)
	@ApiPropertyOptional({ enum: InvoiceType })
	type?: InvoiceType;

	@IsOptional()
	@IsDateString()
	@ApiPropertyOptional()
	fromIssueDate?: Date;

	@IsOptional()
	@IsDateString()
	@ApiPropertyOptional()
	toIssueDate?: Date;
}
