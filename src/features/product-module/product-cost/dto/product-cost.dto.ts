import { ApiProperty } from '@nestjs/swagger';
import { ProductCost } from '@prisma/client';

export class ProductCostDto {
	@ApiProperty()
	id: number;

	@ApiProperty()
	cost: number;

	@ApiProperty()
	productId: number;

	@ApiProperty()
	createdAt: Date;

	@ApiProperty()
	updatedAt: Date;

	@ApiProperty()
	deleteddAt?: Date;

	constructor(data: ProductCost) {
		this.id = data.id;
		this.cost = data.cost.toNumber();
		this.productId = data.productId;
		this.createdAt = data.createdAt;
		this.updatedAt = data.updatedAt;
		this.deleteddAt = data.deletedAt ?? undefined;
	}
}
