import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class CreateMovementDetailDto {
	@IsNumber()
	@ApiProperty({ description: 'ID del producto asociado', example: 1 })
	productId: number;

	@IsNumber()
	@IsOptional()
	@ApiProperty({ description: 'ID del movimiento asociado', example: 1 })
	movementId?: number;

	@IsNumber()
	@ApiProperty({ description: 'Cantidad de productos movidos', example: 10 })
	quantity: number;
}
