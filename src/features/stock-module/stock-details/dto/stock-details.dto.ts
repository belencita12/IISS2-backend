import {
	ProductDto,
	ProductEntity,
} from '@features/product-module/product/dto/product.dto';
import { ApiProperty } from '@nestjs/swagger';
import { StockDetails } from '@prisma/client';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export interface StockDetailEntity extends StockDetails {
	product: ProductEntity;
}

export class StockDetailsDto {
	@IsNotEmpty()
	@IsNumber()
	@ApiProperty({
		description: 'ID del producto relacionado con el detalle de stock.',
		example: 123,
	})
	stockId: number;

	@IsNotEmpty()
	@IsNumber()
	@ApiProperty({
		type: ProductDto,
		description: 'ID del producto relacionado con el detalle de stock.',
		example: 123,
	})
	product: ProductDto;

	@IsNotEmpty()
	@IsNumber()
	@Min(0)
	@ApiProperty({
		description:
			'Cantidad de producto disponible en el stock. Debe ser un número mayor a 0.',
		example: 10,
	})
	amount: number;

	constructor(e: StockDetailEntity) {
		this.stockId = e.stockId;
		this.product = new ProductDto(e.product);
		this.amount = e.amount;
	}
}
