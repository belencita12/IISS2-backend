import { CreatePurchaseDetailDto } from '@features/purchase-module/purchase-detail/dto/create-purchase-detail.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
	IsArray,
	IsDate,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	ValidateNested,
} from 'class-validator';

export class CreatePurchaseDto {
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

	@IsOptional()
	@IsDate()
	@Type(() => Date)
	@ApiPropertyOptional({
		description: 'Fecha de la compra (objeto Date)',
		example: '2025-03-19T00:00:00.000Z',
	})
	date: Date;

	@ApiProperty({
		description: 'Lista de productos comprados',
		type: [CreatePurchaseDetailDto],
		example: [{ productId: 1, quantity: 5 }],
	})
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => CreatePurchaseDetailDto)
	details: CreatePurchaseDetailDto[];
}
