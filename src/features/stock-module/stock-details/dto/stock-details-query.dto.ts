import { PaginationQueryDto } from '@lib/commons/pagination-params.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class StockDetailsQueryDto extends PaginationQueryDto {
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@ApiPropertyOptional({
		description: 'Filtrar por ID del stock en detalles',
	})
	stockId?: number;

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@ApiPropertyOptional({
		description: 'Filtrar por ID de producto en detalles',
	})
	productId?: number;

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	@ApiPropertyOptional({
		description: 'Filtrar por cantidad en detalles',
	})
	amount?: number;
}
