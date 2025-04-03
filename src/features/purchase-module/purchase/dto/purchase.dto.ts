import { ProviderDto } from '@features/provider/dto/provider.dto';
import { StockDto } from '@features/stock-module/stock/dto/stock.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
	IsDate,
	IsDateString,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	Min,
} from 'class-validator';
import Decimal from 'decimal.js';

export class PurchaseDto {
	@IsNotEmpty()
	@IsNumber()
	@ApiProperty({
		description: 'ID del proveedor relacionado',
		example: 2,
	})
	providerId: number;

	@IsNotEmpty()
	@IsNumber()
	@ApiProperty({
		description: 'ID del deposito relacionado.',
		example: 3,
	})
	stockId: number;

	@IsNotEmpty()
	@IsNumber()
	@Min(0)
	@ApiProperty({
		example: 0.1,
	})
	ivaTotal: number;

	@IsNotEmpty()
	@IsNumber()
	@Min(0)
	@ApiProperty({
		description: 'Cantidad total del la compra.',
		example: 1000000,
	})
	total: number | Decimal;

	@IsOptional()
	@IsDate()
	@Type(() => Date)
	@ApiPropertyOptional({
		description: 'Fecha de la compra (objeto Date)',
		example: '2025-03-19T00:00:00.000Z',
	})
	date: Date;

	@IsNotEmpty()
	@IsNumber()
	@ApiProperty({
		type: ProviderDto,
		description: 'ID del producto relacionado con el detalle de stock.',
		example: 123,
	})
	provider: ProviderDto;

	@IsNotEmpty()
	@IsNumber()
	@ApiProperty({
		type: StockDto,
		description: 'ID del producto relacionado con el detalle de stock.',
		example: 123,
	})
	stock: StockDto;

	@Expose()
	@IsNumber()
	@ApiProperty({
		description: 'Cantidad total de compras (detalles) realizadas.',
		example: 5,
	})
	items: number;

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

	constructor(partial: Partial<PurchaseDto>) {
		Object.assign(this, partial);
	}
}
