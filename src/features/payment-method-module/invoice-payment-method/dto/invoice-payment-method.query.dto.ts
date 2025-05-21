import { ApiPropertyOptional } from '@nestjs/swagger';
import {IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '@lib/commons/pagination-params.dto';
import { IsId } from '@lib/decorators/validation/is-id.decorator';

export class InvoicePaymentMethodQueryDto extends PaginationQueryDto {
	@IsOptional()
	@IsId()
	@Type(() => Number)
	@ApiPropertyOptional()
	invoiceId?: number;

	@IsOptional()
	@IsId()
	@Type(() => Number)
	@ApiPropertyOptional()
	methodId?: number;

	@IsOptional()
	@IsNumber()
	@Min(0)
	@Type(() => Number)
	@ApiPropertyOptional()
	amountMin?: number;

	@IsOptional()
	@IsNumber()
	@Min(0)
	@Type(() => Number)
	@ApiPropertyOptional()
	amountMax?: number;
}
