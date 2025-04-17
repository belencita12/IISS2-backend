import { PaginationQueryDto } from '@lib/commons/pagination-params.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

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
	@IsInt()
	@IsPositive()
	@ApiPropertyOptional({
		description: 'Filtrar desde cierta cantidad de productos en el deposito',
	})
	fromAmount?: number;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@IsPositive()
	@ApiPropertyOptional({
		description: 'Filtrar hasta cierta cantidad de productos en el deposito',
	})
	toAmount?: number;
}
