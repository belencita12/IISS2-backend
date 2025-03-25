import { PaginationQueryDto } from '@lib/commons/pagination-params.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MovementType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDateString, IsNumber, IsOptional } from 'class-validator';

export class MovementQueryDto extends PaginationQueryDto {
	@IsNumber()
	@IsOptional()
	@Type(() => Number)
	@ApiPropertyOptional({
		description: 'ID del encargado del movimiento.',
	})
	managerId?: number;

	@IsOptional()
	@ApiPropertyOptional({
		description: 'Tipo de movimiento',
	})
	type?: MovementType;

	@IsDateString()
	@IsOptional()
	@ApiPropertyOptional({
		description: 'Fecha del movimiento',
	})
	dateMovement?: Date;

	@IsNumber()
	@IsOptional()
	@Type(() => Number)
	@ApiPropertyOptional({
		description: 'ID del stock de origen',
	})
	originStockId?: number;

	@IsNumber()
	@IsOptional()
	@Type(() => Number)
	@ApiPropertyOptional({
		description: 'ID del stock de destino',
	})
	destinationStockId?: number;
}
