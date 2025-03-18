import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class StockDetailsDto {
	@IsNotEmpty()
	@IsNumber()
	@ApiProperty({
		description: 'ID del producto relacionado con el detalle de stock.',
		example: 123,
	})
	productId: number;

	@IsNotEmpty()
	@IsNumber()
	@Min(0)
	@ApiProperty({
		description:
			'Cantidad de producto disponible en el stock. Debe ser un número mayor a 0.',
		example: 10,
	})
	amount: number;

	constructor(partial: Partial<StockDetailsDto>) {
		Object.assign(this, partial);
	}
}
