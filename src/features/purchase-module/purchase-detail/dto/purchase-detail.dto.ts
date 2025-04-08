import {
	ProductDto,
	ProductEntity,
} from '@features/product-module/product/dto/product.dto';
import { ApiProperty } from '@nestjs/swagger';
import { PurchaseDetail } from '@prisma/client';

export interface PurchaseDetailEntity extends PurchaseDetail {
	product: ProductEntity;
}

export class PurchaseDetailDto {
	@ApiProperty({ example: 1 })
	id: number;

	@ApiProperty({ example: 1 })
	purchaseId: number;

	@ApiProperty({ example: 25000 })
	unitCost: number;

	@ApiProperty({ example: 500000 })
	partialAmount: number;

	@ApiProperty({ example: 50000 })
	partialAmountVAT: number;

	@ApiProperty({ example: 2 })
	quantity: number;

	@ApiProperty({ type: ProductDto })
	product: ProductDto;

	constructor(e: PurchaseDetailEntity) {
		this.id = e.id;
		this.purchaseId = e.purchaseId;
		this.quantity = e.quantity;
		this.unitCost = e.unitCost.toNumber();
		this.partialAmount = e.partialAmount.toNumber();
		this.partialAmountVAT = e.partialAmountVAT.toNumber();
		this.product = new ProductDto(e.product);
	}
}
