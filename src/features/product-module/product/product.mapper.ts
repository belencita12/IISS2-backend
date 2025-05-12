import {
	Product,
	ProductPrice,
	ProductCost,
	ProductTag,
	Image,
	Tag,
	Provider,
} from '@prisma/client';
import { PublicProductDto } from './dto/public-product.dto';
import { ProductDto } from './dto/product.dto';

export interface ProductEntity extends Product {
	prices: ProductPrice[];
	costs: ProductCost[];
	image: Image | null;
	provider: Provider | null;
	tags?: (ProductTag & { tag: Tag })[];
}

export class ProductMapper {
	static toDto(data: ProductEntity, isPublic: true): PublicProductDto;
	static toDto(data: ProductEntity, isPublic?: false): ProductDto;
	static toDto(data: ProductEntity, isPublic?: boolean): ProductDto;

	static toDto(
		data: ProductEntity,
		isPublic: boolean = false,
	): PublicProductDto | ProductDto {
		if (isPublic) {
			return {
				id: data.id,
				name: data.name,
				category: data.category,
				description: data.description || '',
				price: data.prices[0].amount.toNumber(),
				iva: data.iva,
				tags: data.tags ? data.tags.map((t) => t.tag.name) : [],
				image: data.image
					? {
							id: data.image.id,
							originalUrl: data.image.originalUrl,
							previewUrl: data.image.previewUrl,
						}
					: undefined,
			};
		}

		return {
			id: data.id,
			name: data.name,
			category: data.category,
			description: data.description || '',
			iva: data.iva,
			code: data.code,
			quantity: data.quantity,
			price: data.prices[0].amount.toNumber(),
			cost: data.costs[0].cost.toNumber(),
			tags: data.tags ? data.tags.map((t) => t.tag.name) : [],
			provider: data.provider
				? { id: data.provider.id, name: data.provider.businessName }
				: undefined,
			image: data.image
				? {
						id: data.image.id,
						originalUrl: data.image.originalUrl,
						previewUrl: data.image.previewUrl,
					}
				: undefined,
		};
	}
}
