import { PaginationQueryDto } from '@lib/commons/pagination-params.dto';
import { IsId } from '@lib/decorators/validation/is-id.decorator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class PurchaseQueryDto extends PaginationQueryDto {
	@IsOptional()
	@Type(() => Number)
	@IsId()
	@ApiPropertyOptional()
	stockId?: number;

	@IsOptional()
	@Type(() => Number)
	@IsId()
	@ApiPropertyOptional()
	providerId?: number;

	@IsOptional()
	@Type(() => Number)
	@ApiPropertyOptional()
	totalMin?: number;

	@IsOptional()
	@Type(() => Number)
	@ApiPropertyOptional()
	totalMax?: number;
}
