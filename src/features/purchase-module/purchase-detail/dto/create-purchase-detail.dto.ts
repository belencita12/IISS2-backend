import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreatePurchaseDetailDto {
	@IsNotEmpty()
	@IsNumber()
	@ApiProperty({
		description: 'ID del producto relacionado con el detalle de compras.',
		example: 9,
	})
	productId: number;

	@IsNotEmpty()
	@IsNumber()
	@Min(0)
	@ApiProperty({
		description: 'Cantidad de productos. Debe ser un número mayor a 0.',
		example: 20,
	})
	quantity: number;
}
