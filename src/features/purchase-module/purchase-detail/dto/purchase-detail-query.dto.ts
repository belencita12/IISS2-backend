import { PaginationQueryDto } from '@lib/commons/pagination-params.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class PurchaseDetailQueryDto extends PaginationQueryDto {
	@IsOptional()
	@IsNumber()
	@Transform(({ value }) => Number(value))
	@ApiPropertyOptional()
	purchaseId?: number;

	@IsOptional()
	@IsString()
	@ApiPropertyOptional()
	productName?: string;
}
