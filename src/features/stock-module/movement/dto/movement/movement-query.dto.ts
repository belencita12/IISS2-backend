import { PaginationQueryDto } from '@lib/commons/pagination-params.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MovementType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

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

	@IsOptional()
	@IsString()
	@ApiPropertyOptional({
		description: 'Nombre de la sucursal de origen',
	})
	originBranch?: string;

	@IsNumber()
	@IsOptional()
	@Type(() => Number)
	@ApiPropertyOptional({
		description: 'ID del stock de destino',
	})
	destinationStockId?: number;

	@IsOptional()
	@IsString()
	@ApiPropertyOptional({
		description: 'Nombre de la sucursal de destino',
	})
	destinationBranch?: string;
}
