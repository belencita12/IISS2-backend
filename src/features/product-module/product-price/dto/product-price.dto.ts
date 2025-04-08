import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductPriceDto {
	@ApiProperty()
	id: number;

	@ApiProperty({ example: 10000 })
	amount: number;

	@ApiProperty()
	active: boolean;

	@ApiProperty()
	createdAt: Date;

	@ApiProperty()
	updatedAt: Date;

	@ApiPropertyOptional()
	deletedAt: Date | null;

	@ApiProperty()
	productId: number;
}
