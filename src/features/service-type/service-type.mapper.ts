import { PublicServiceTypeDto } from './dto/public-service-type.dto';
import { ServiceTypeDto, ServiceTypeEntity } from './dto/service-type.dto';

export class ServiceTypeMapper {
	static toDto(
		data: ServiceTypeEntity,
		isPublic = false,
	): ServiceTypeDto | PublicServiceTypeDto {
		if (!isPublic)
			return {
				id: data.id,
				name: data.name,
				slug: data.slug,
				description: data.description,
				durationMin: data.durationMin,
				maxColabs: data.maxColabs || undefined,
				isPublic: data.isPublic,
				iva: data.product.iva,
				price: data.product.prices[0].amount.toNumber(),
				cost: data.product.costs[0].cost.toNumber(),
				tags: data.product.tags?.map((t) => t.tag.name),
				img: data.product.image
					? {
							id: data.product.image.id,
							originalUrl: data.product.image.originalUrl,
							previewUrl: data.product.image.previewUrl,
						}
					: undefined,
			};
		else
			return {
				id: data.id,
				name: data.name,
				slug: data.slug,
				description: data.description,
				durationMin: data.durationMin,
				iva: data.product.iva,
				price: data.product.prices[0].amount.toNumber(),
				tags: data.product.tags?.map((t) => t.tag.name),
				img: data.product.image
					? {
							id: data.product.image.id,
							originalUrl: data.product.image.originalUrl,
							previewUrl: data.product.image.previewUrl,
						}
					: undefined,
			};
	}
}
