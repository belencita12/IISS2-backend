import { ApiProperty } from '@nestjs/swagger';
import { Stock } from '@prisma/client';

export class StockSummaryDto {
	@ApiProperty()
	id: number;

	@ApiProperty({ example: 'Stock A' })
	name: string;

	@ApiProperty({ example: 'Encarnación' })
	address: string;

	constructor(data: Stock) {
		this.id = data.id;
		this.name = data.name;
		this.address = data.address;
	}
}
