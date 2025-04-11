import {
	ProductDto,
	ProductEntity,
} from '@features/product-module/product/dto/product.dto';
import { ApiProperty } from '@nestjs/swagger';
import { InvoiceDetail } from '@prisma/client';
import { Type } from 'class-transformer';

export interface InvoiceDetailEntity extends InvoiceDetail {
	product: ProductEntity;
}

export class InvoiceDetailDto {
	@ApiProperty()
	id: number;

	@ApiProperty()
	invoiceId: number;

	@Type(() => ProductDto)
	@ApiProperty()
	product: ProductDto;

	@ApiProperty()
	partialAmount: number;

	@ApiProperty()
	partialAmountVAT: number;

	@ApiProperty()
	quantity: number;

	@ApiProperty()
	unitCost: number;

	constructor(data: InvoiceDetailEntity) {
		this.id = data.id;
		this.invoiceId = data.invoiceId;
		this.partialAmount = data.partialAmount.toNumber();
		this.partialAmountVAT = data.partialAmountVAT.toNumber();
		this.product = new ProductDto(data.product);
		this.quantity = data.quantity;
		this.unitCost = data.unitCost.toNumber();
	}
}
