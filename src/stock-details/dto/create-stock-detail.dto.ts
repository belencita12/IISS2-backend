import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class CreateStockDetailsDto {
	@IsNumber()
	@ApiProperty({
		description: 'ID del stock relacionado con el detalle de stock.',
		example: 1,
	})
	stockId: number;

	@IsNumber()
	@ApiProperty({
		description: 'ID del producto relacionado con el detalle de stock.',
		example: 2,
	})
	productId: number;

	@IsNumber()
	@Min(0)
	@ApiProperty({
		description:
			'Cantidad de producto disponible en el stock. Debe ser un número mayor a 0',
		example: 10,
	})
	amount: number;
}
