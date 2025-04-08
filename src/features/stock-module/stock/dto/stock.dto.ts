import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class StockDto {
	@ApiProperty()
	id: number;

	@IsString()
	@ApiProperty({ example: 'Stock A' })
	name: string;

	@IsString()
	@ApiProperty({ example: 'Encarnación' })
	address: string;

	@ApiProperty()
	createdAt: Date;

	@ApiProperty()
	updatedAt: Date;

	@ApiPropertyOptional()
	deletedAt: Date | null;

	constructor(partial: Partial<StockDto>) {
		Object.assign(this, partial);
	}
}
