import { PaginationQueryDto } from '@lib/commons/pagination-params.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class StockQueryDto extends PaginationQueryDto {
	@IsOptional()
	@IsString()
	@ApiPropertyOptional({
		description: 'Filtrar por nombre del stock',
	})
	name?: string;

	@IsOptional()
	@IsString()
	@ApiPropertyOptional({
		description: 'Filtrar por dirección del stock',
	})
	address?: string;
}
