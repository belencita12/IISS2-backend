import { CreatePurchaseDetailDto } from '@features/purchase-module/purchase-detail/dto/create-purchase-detail.dto';
import { IsId } from '@lib/decorators/validation/is-id.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDate, IsOptional, ValidateNested } from 'class-validator';

export class CreatePurchaseDto {
	@IsId()
	@ApiProperty({ example: 1 })
	providerId: number;

	@IsId()
	@ApiProperty({ example: 1 })
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
