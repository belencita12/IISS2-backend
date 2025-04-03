import { PaginationQueryDto } from '@lib/commons/pagination-params.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class PurchaseQueryDto extends PaginationQueryDto {
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
	providerId?: number;
}
