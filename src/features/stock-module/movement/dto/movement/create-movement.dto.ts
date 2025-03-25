import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MovementType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
	IsArray,
	IsDateString,
	IsNumber,
	IsOptional,
	IsString,
	ValidateNested,
} from 'class-validator';
import { CreateMovementDetailDto } from '../movement-detail/create-movement-detail.dto';

export class CreateMovementDto {
	@IsString()
	@IsOptional()
	@ApiPropertyOptional({
		description: 'Descripción del movimiento realizado.',
		example: 'Transferencia de inventario entre almacenes',
	})
	description?: string;

	@IsNumber()
	@ApiProperty({
		description: 'ID del encargado del movimiento.',
		example: 2,
	})
	managerId: number;

	@IsString()
	@ApiProperty({
		description: 'Tipo de movimiento',
		enum: MovementType,
	})
	type: MovementType;

	@IsDateString()
	@ApiPropertyOptional({
		description: 'Fecha del movimiento',
		example: '2025-03-19T14:00:00.000Z',
	})
	dateMovement?: Date;

	@IsNumber()
	@IsOptional()
	@ApiProperty({
		description: 'ID del stock de origen',
		example: 1,
	})
	originStockId?: number;

	@IsNumber()
	@IsOptional()
	@ApiProperty({
		description: 'ID del stock de destino',
		example: 2,
	})
	destinationStockId?: number;

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => CreateMovementDetailDto)
	@ApiProperty({
		type: [CreateMovementDetailDto],
		description: 'Detalles del movimiento',
	})
	details: CreateMovementDetailDto[];
}
