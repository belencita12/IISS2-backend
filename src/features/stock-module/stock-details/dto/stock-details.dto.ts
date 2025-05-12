import { ProductDto } from '@features/product-module/product/dto/product.dto';
import {
	ProductEntity,
	ProductMapper,
} from '@features/product-module/product/product.mapper';
import { ApiProperty } from '@nestjs/swagger';
import { StockDetails } from '@prisma/client';

export interface StockDetailEntity extends StockDetails {
	product: ProductEntity;
}

export class StockDetailsDto {
	@ApiProperty({
		description: 'ID del producto relacionado con el detalle de stock.',
		example: 123,
	})
	stockId: number;

	@ApiProperty({
		type: ProductDto,
		description: 'ID del producto relacionado con el detalle de stock.',
		example: 123,
	})
	product: ProductDto;

	@ApiProperty({
		description:
			'Cantidad de producto disponible en el stock. Debe ser un número mayor a 0.',
		example: 10,
	})
	amount: number;

	constructor(e: StockDetailEntity) {
		this.stockId = e.stockId;
		this.product = ProductMapper.toDto(e.product);
		this.amount = e.amount;
	}
}
