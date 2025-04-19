import { ImageDto } from '@lib/commons/image.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	Category,
	Image,
	Product,
	ProductPrice,
	ProductTag,
	Provider,
	Tag,
} from '@prisma/client';
import { IsEnum, IsInt, IsNumber, IsString, IsArray } from 'class-validator';

export interface ProductEntity extends Product {
	price: ProductPrice;
	image: Image | null;
	tags?: (ProductTag & { tag: Tag })[];
	providers?: { provider: Provider }[];
}

export class ProductDto {
	constructor(data: ProductEntity) {
		this.name = data.name;
		this.id = data.id;
		this.code = data.code;
		this.cost = data.cost.toNumber();
		this.iva = data.iva;
		this.image = data.image
			? {
					id: data.image.id,
					originalUrl: data.image.originalUrl,
					previewUrl: data.image.previewUrl,
				}
			: undefined;
		this.category = data.category;
		this.price = data.price.amount.toNumber();
		this.quantity = data.quantity;
		this.tags = data.tags ? data.tags.map((t) => t.tag.name) : [];
		this.providers = data.providers
			? data.providers.map((provider) => provider.provider.id)
			: [];
		this.createdAt = data.createdAt;
		this.updatedAt = data.updatedAt;
		this.deletedAt = data.deletedAt;
	}

	@IsInt()
	@ApiProperty({ example: 1 })
	id: number;

	@IsString()
	@ApiProperty({ example: 'Wiskas Cachorros 500gr' })
	name: string;

	@IsString()
	@ApiProperty({ example: 'PROD-123' })
	code: string;

	@IsNumber()
	@ApiProperty({ example: 10000 })
	cost: number;

	@IsNumber()
	@ApiProperty({ example: 0.1 })
	iva: number;

	@IsEnum(Category)
	@ApiProperty({ enum: Category })
	category: Category;

	@IsNumber()
	@ApiProperty({ example: 40000 })
	price: number;

	@ApiPropertyOptional({ type: ImageDto })
	image?: ImageDto;

	@IsNumber()
	@ApiProperty({ example: 20 })
	quantity: number;

	@IsArray()
	@ApiPropertyOptional({ type: [String] })
	tags: string[];

	@IsArray()
	@ApiPropertyOptional({ type: [Number] })
	providers: number[];

	@ApiProperty()
	createdAt: Date;

	@ApiProperty()
	updatedAt: Date;

	@ApiPropertyOptional()
	deletedAt: Date | null;
}
