import { PaginationQueryDto } from '@lib/commons/pagination-params.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MovementType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNumber, IsOptional } from 'class-validator';

export class MovementQueryDto extends PaginationQueryDto {
	@IsNumber()
	@IsOptional()
	@Type(() => Number)
	@ApiPropertyOptional({
		description: 'ID del encargado del movimiento.',
	})
	managerId?: number;

	@IsOptional()
	@IsEnum(MovementType)
	@ApiPropertyOptional({
		description: 'Tipo de movimiento',
		enum: MovementType,
		enumName: 'MovementType',
	})
	type?: MovementType;

	@IsOptional()
	@Type(() => Date)
	@IsDate()
	@ApiPropertyOptional({
		description: 'Fecha para filtrar los movimientos (formato ISO 8601)',
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
