import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MovementType } from '@prisma/client';
import { Expose } from 'class-transformer';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';
import { MovementDetailDto } from '../movement-detail/movement-detail.dto';

export class MovementDto {
	@IsNumber()
	@ApiProperty({ description: 'ID del movimiento', example: 1 })
	id: number;

	@IsString()
	@ApiPropertyOptional({
		description: 'Descripción del movimiento realizado.',
		example: 'Transferencia de inventario entre almacenes',
	})
	description?: string;

	@IsNumber()
	@ApiProperty({
		description: 'ID del encargado del movimiento.',
		example: 5,
	})
	managerId: number;

	@ApiProperty({
		description: 'Tipo de movimiento',
		enum: MovementType,
	})
	type: MovementType;

	@IsDateString()
	@ApiProperty({
		description: 'Fecha del movimiento',
		example: '2025-03-19T14:00:00.000Z',
	})
	dateMovement: Date;

	@IsNumber()
	@IsOptional()
	@ApiPropertyOptional({
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

	@ApiProperty({
		description: 'Detalles del movimiento',
		type: [MovementDetailDto],
	})
	details: MovementDetailDto[];

	@Expose()
	@IsDateString()
	@ApiProperty()
	createdAt: Date;

	@Expose()
	@IsDateString()
	@ApiProperty()
	updatedAt: Date;

	@Expose()
	@IsOptional()
	@IsDateString()
	@ApiPropertyOptional()
	deletedAt: Date | null;

	constructor(partial: Partial<MovementDto>) {
		Object.assign(this, partial);
	}
}
