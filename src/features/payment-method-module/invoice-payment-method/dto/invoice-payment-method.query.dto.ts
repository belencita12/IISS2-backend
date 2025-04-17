import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '@lib/commons/pagination-params.dto';

export class InvoicePaymentMethodQueryDto extends PaginationQueryDto {
	@IsOptional()
	@IsInt()
	@Type(() => Number)
	@ApiPropertyOptional()
	invoiceId?: number;

	@IsOptional()
	@IsInt()
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
