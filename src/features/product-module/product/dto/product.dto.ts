import { ImageDto } from '@lib/commons/image.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	Category,
	Image,
	Product,
	ProductCost,
	ProductPrice,
	ProductTag,
	Tag,
} from '@prisma/client';

export interface ProductEntity extends Product {
	prices: ProductPrice[];
	costs: ProductCost[];
	image: Image | null;
	tags?: (ProductTag & { tag: Tag })[];
}

export class ProductDto {
	@ApiProperty({ example: 1 })
	id: number;

	@ApiProperty({ example: 'Wiskas Cachorros 500gr' })
	name: string;

	@ApiProperty({
		example: 'Es un paquete de comida de la marca Wiskas y trae 500gr',
	})
	description: string;

	@ApiProperty({ example: '127319231972' })
	code: string;

	@ApiProperty({ example: 10000 })
	cost: number;

	@ApiProperty({ example: 0.1 })
	iva: number;

	@ApiProperty({ enum: Category })
	category: Category;

	@ApiProperty({ example: 40000 })
	price: number;

	@ApiPropertyOptional({ type: ImageDto })
	image?: ImageDto;

	@ApiProperty({ example: 20 })
	quantity: number;

	@ApiPropertyOptional({ type: [String] })
	tags: string[];

	@ApiProperty()
	createdAt: Date;

	@ApiProperty()
	updatedAt: Date;

	@ApiPropertyOptional()
	deletedAt: Date | null;

	constructor(data: ProductEntity) {
		this.name = data.name;
		this.id = data.id;
		this.code = data.code;
		this.description = data.description || '';
		this.cost = data.costs[0].cost.toNumber();
		this.iva = data.iva;
		this.image = data.image
			? {
					id: data.image.id,
					originalUrl: data.image.originalUrl,
					previewUrl: data.image.previewUrl,
				}
			: undefined;
		this.category = data.category;
		this.price = data.prices[0].amount.toNumber();
		this.quantity = data.quantity;
		this.tags = data.tags ? data.tags.map((t) => t.tag.name) : [];
		this.createdAt = data.createdAt;
		this.updatedAt = data.updatedAt;
		this.deletedAt = data.deletedAt;
	}
}
