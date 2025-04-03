import { PaginationQueryDto } from '@lib/commons/pagination-params.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class PurchaseDetailQueryDto extends PaginationQueryDto {
	@IsOptional()
	@IsNumber()
	@Transform(({ value }) => Number(value))
	@ApiPropertyOptional({
		description: 'ID de compra relacionado con el detalle de compras.',
	})
	purchaseId?: number;

	@IsOptional()
	@IsNumber()
	@Transform(({ value }) => Number(value))
	@ApiPropertyOptional({
		description: 'ID del producto relacionado con el detalle de compras.',
	})
	productId?: number;
}
