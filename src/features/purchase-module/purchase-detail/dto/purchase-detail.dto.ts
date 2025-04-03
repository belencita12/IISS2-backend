import { ProductEntity } from '@features/product-module/product/dto/product.dto';
import { ImageDto } from '@lib/commons/image.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PurchaseDetail } from '@prisma/client';
import { Expose, Transform } from 'class-transformer';
import {
	IsDateString,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	Min,
} from 'class-validator';
import decimal from 'decimal.js';

export interface PurchaseDetailEntity extends PurchaseDetail {
	product: ProductEntity;
}

export class PurchaseDetailDto {
	@IsNotEmpty()
	@IsNumber()
	@ApiProperty({
		description: 'ID de compra relacionado con el detalle de compras.',
		example: 3,
	})
	purchaseId: number;

	@Transform(({ value }) => Number(value))
	@IsNotEmpty()
	@IsNumber()
	@ApiProperty({
		description: 'Costo unitario del product.',
		example: 25000,
	})
	unitCost: number | decimal;

	@Transform(({ value }) => Number(value))
	@IsNotEmpty()
	@IsNumber()
	@ApiProperty({
		description: 'Costo total de los productos.',
		example: 500000,
	})
	partialAmount: number | decimal;

	@Transform(({ value }) => Number(value))
	@IsNotEmpty()
	@IsNumber()
	@ApiProperty({
		description:
			'Costo total de los productos en esa línea del detalle de compra, incluyendo el IVA.',
		example: 50000,
	})
	partialAmountVAT: number | decimal;

	@IsNotEmpty()
	@IsNumber()
	@Min(0)
	@ApiProperty({
		description: 'Cantidad de productos. Debe ser un número mayor a 0.',
		example: 20,
	})
	quantity: number;

	@ApiProperty({
		description: 'Categoría del producto',
		example: 'Juguete',
	})
	@Expose()
	category: string;

	@ApiProperty({
		description: 'Nombre del producto',
		example: 'Pelota para perros',
	})
	@Expose()
	productName: string;

	@ApiPropertyOptional({
		description: 'Imagen del producto',
		type: ImageDto,
	})
	@Expose()
	productImage?: ImageDto;

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

	constructor(e: PurchaseDetailEntity) {
		this.purchaseId = e.purchaseId;
		this.quantity = e.quantity;
		this.unitCost = Number(e.unitCost);
		this.partialAmount = Number(e.partialAmount);
		this.partialAmountVAT = Number(e.partialAmountVAT);
		this.createdAt = e.createdAt;
		this.updatedAt = e.updatedAt;
		this.deletedAt = e.deletedAt;
		this.category = e.product.category;
		this.productName = e.product.name;
		this.productImage = e.product.image
			? {
					id: e.product.image.id,
					previewUrl: e.product.image.previewUrl,
					originalUrl: e.product.image.originalUrl,
				}
			: undefined;
	}
}
