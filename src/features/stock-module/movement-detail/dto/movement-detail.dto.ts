import {
	ProductDto,
	ProductEntity,
} from '@features/product-module/product/dto/product.dto';
import { ApiProperty } from '@nestjs/swagger';
import { MovementDetail } from '@prisma/client';

export interface MovementDetailEntity extends MovementDetail {
	product: ProductEntity;
}

export class MovementDetailDto {
	constructor(entity: MovementDetailEntity) {
		this.id = entity.id;
		this.product = new ProductDto(entity.product);
		this.movementId = entity.movementId;
		this.quantity = entity.quantity;
	}

	@ApiProperty()
	id: number;

	@ApiProperty({ type: ProductDto })
	product: ProductDto;

	@ApiProperty()
	movementId: number;

	@ApiProperty()
	quantity: number;
}
