import { Prisma } from '@prisma/client';
import { ServiceTypeQueryDto } from './dto/service-type-query.dto';

export class ServiceTypeFilter {
	static getWhere(
		baseWhere: Prisma.ServiceTypeWhereInput,
		dto: ServiceTypeQueryDto,
	): Prisma.ServiceTypeWhereInput {
		return {
			...baseWhere,
			name: { contains: dto.name, mode: 'insensitive' },
			product: {
				prices:
					dto.minPrice || dto.maxPrice
						? {
								some: {
									amount: { gte: dto.minPrice, lte: dto.maxPrice },
									isActive: true,
								},
							}
						: undefined,
				tags: dto.tags
					? { some: { tag: { name: { in: dto.tags } } } }
					: undefined,
			},
			durationMin:
				dto.fromDuration || dto.toDuration
					? {
							gte: dto.fromDuration,
							lte: dto.toDuration,
						}
					: undefined,
		};
	}
}
