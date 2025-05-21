import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductPrice } from '@prisma/client';

export class ProductPriceDto {
	@ApiProperty()
	id: number;

	@ApiProperty({ example: 10000 })
	amount: number;

	@ApiProperty()
	isActive: boolean;

	@ApiProperty()
	createdAt: Date;

	@ApiProperty()
	productId: number;

	@ApiProperty()
	updatedAt: Date;

	@ApiPropertyOptional()
	deletedAt?: Date;

	constructor(data: ProductPrice) {
		this.id = data.id;
		this.amount = data.amount.toNumber();
		this.isActive = data.isActive;
		this.productId = data.productId;
		this.createdAt = data.createdAt;
		this.updatedAt = data.updatedAt;
		this.deletedAt = data.deletedAt ?? undefined;
	}
}
