import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class StockDto {
	@IsString()
	@ApiProperty({
		description: 'Nombre del deposito.',
		example: 'Stock A',
	})
	name: string;

	@IsString()
	@ApiProperty({
		description: 'Dirección del deposito.',
		example: 'Encarnación',
	})
	address: string;

	@Expose()
	@IsDateString()
	@ApiProperty()
	createdAt: Date;

	@Expose()
	@IsDateString()
	@ApiProperty()
	updatedAt: Date;

	@Expose()
	@IsOptional()
	@IsDateString()
	@ApiPropertyOptional()
	deletedAt: Date | null;

	constructor(partial: Partial<StockDto>) {
		Object.assign(this, partial);
	}
}
