import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Stamped, Stock } from '@prisma/client';

export interface StockEntity extends Stock {
	stamped: Stamped[];
}

export class StockDto {
	@ApiProperty()
	id: number;

	@ApiProperty({ example: 'Stock A' })
	name: string;

	@ApiProperty({ example: 'Encarnación' })
	address: string;

	@ApiProperty({ example: '001' })
	stockNum: string;

	@ApiProperty({ example: '12345678' })
	stamped: string;

	@ApiProperty()
	createdAt: Date;

	@ApiProperty()
	updatedAt: Date;

	@ApiPropertyOptional()
	deletedAt?: Date;

	constructor(data: StockEntity) {
		this.id = data.id;
		this.name = data.name;
		this.address = data.address;
		this.stockNum = data.stockNum.toString().padStart(3, '0');
		this.stamped = data.stamped[0].stampedNum;
		this.createdAt = data.createdAt;
		this.updatedAt = data.updatedAt;
		this.deletedAt = data.deletedAt || undefined;
	}
}
