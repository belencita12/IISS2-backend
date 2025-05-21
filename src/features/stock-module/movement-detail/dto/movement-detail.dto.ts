import { ProductDto } from '@features/product-module/product/dto/product.dto';
import {
	ProductEntity,
	ProductMapper,
} from '@features/product-module/product/product.mapper';
import { ApiProperty } from '@nestjs/swagger';
import { MovementDetail } from '@prisma/client';

export interface MovementDetailEntity extends MovementDetail {
	product: ProductEntity;
}

export class MovementDetailDto {
	@ApiProperty()
	id: number;

	@ApiProperty({ type: ProductDto })
	product: ProductDto;

	@ApiProperty()
	movementId: number;

	@ApiProperty()
	quantity: number;

	constructor(entity: MovementDetailEntity) {
		this.id = entity.id;
		this.product = ProductMapper.toDto(entity.product);
		this.movementId = entity.movementId;
		this.quantity = entity.quantity;
	}
}
