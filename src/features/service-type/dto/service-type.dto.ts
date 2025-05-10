import { ProductEntity } from '@features/product-module/product/product.mapper';
import { ImageDto } from '@lib/commons/image.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceType } from '@prisma/client';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

export interface ServiceTypeEntity extends ServiceType {
	product: ProductEntity;
}

export class ServiceTypeDto {
	@ApiProperty()
	id: number;

	@ApiProperty()
	slug: string;

	@ApiProperty()
	name: string;

	@ApiProperty()
	description: string;

	@ApiProperty()
	durationMin: number;

	@ApiProperty()
	maxColabs?: number;

	@ApiProperty()
	isPublic: boolean;

	@ApiProperty()
	iva: number;

	@ApiProperty()
	price: number;

	@ApiProperty()
	cost: number;

	@ApiPropertyOptional()
	tags?: string[];

	@ValidateNested()
	@Type(() => ImageDto)
	@ApiPropertyOptional({ type: ImageDto })
	img?: ImageDto;

	constructor(data: ServiceTypeEntity) {
		this.id = data.id;
		this.name = data.name;
		this.slug = data.slug;
		this.description = data.description;
		this.durationMin = data.durationMin;
		this.maxColabs = data.maxColabs || undefined;
		this.isPublic = data.isPublic;
		this.iva = data.product.iva;
		this.price = data.product.prices[0].amount.toNumber();
		this.cost = data.product.costs[0].cost.toNumber();
		this.tags = data.product.tags?.map((t) => t.tag.name);
		this.img = data.product.image
			? {
					id: data.product.image.id,
					originalUrl: data.product.image.originalUrl,
					previewUrl: data.product.image.previewUrl,
				}
			: undefined;
	}
}
