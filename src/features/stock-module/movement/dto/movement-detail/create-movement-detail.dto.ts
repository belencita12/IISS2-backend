import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class CreateMovementDetailDto {
	@ApiHideProperty()
	@IsOptional()
	movementId?: number;

	@IsNumber()
	@ApiProperty({ description: 'ID del producto asociado', example: 1 })
	productId: number;

	@IsNumber()
	@ApiProperty({ description: 'Cantidad de productos movidos', example: 10 })
	quantity: number;
}
