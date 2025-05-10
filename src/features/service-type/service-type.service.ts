import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateServiceTypeDto } from './dto/create-service-type.dto';
import { PrismaService } from '@features/prisma/prisma.service';
import { ServiceTypeQueryDto } from './dto/service-type-query.dto';
import { ImageService } from '@features/media-module/image/image.service';
import { TagService } from '@features/product-module/tag/tag.service';
import Decimal from 'decimal.js';
import { genRandomCode } from '@lib/utils/encrypt';
import { ServiceTypeDto } from './dto/service-type.dto';
import { Prisma } from '@prisma/client';
import { ProductService } from '@features/product-module/product/product.service';
import { ProductPricingService } from '@features/product-module/product/product-pricing.service';

@Injectable()
export class ServiceTypeService {
	constructor(
		private readonly db: PrismaService,
		private readonly productService: ProductService,
		private readonly tagService: TagService,
		private readonly imgService: ImageService,
		private readonly productPricingService: ProductPricingService,
	) {}

	async create(dto: CreateServiceTypeDto) {
		const { img, tags, price, iva, cost, ...data } = dto;
		const newImg = img ? await this.imgService.create(img) : null;
		const serviceType = await this.db.serviceType.create({
			...this.getInclude(),
			data: {
				...data,
				product: {
					create: {
						imageId: newImg ? newImg.id : undefined,
						prices: { create: { amount: new Decimal(price) } },
						costs: { create: { cost: new Decimal(cost) } },
						tags: this.tagService.connectTags(tags),
						code: genRandomCode(),
						category: 'SERVICE',
						name: data.name,
						iva: iva,
					},
				},
			},
		});
		return new ServiceTypeDto(serviceType);
	}

	async findAll(dto: ServiceTypeQueryDto) {
		const where = this.applyFilters(dto);
		const [data, count] = await Promise.all([
			this.db.serviceType.findMany({
				...this.db.paginate(dto),
				...this.getInclude(),
				where,
			}),
			this.db.serviceType.count({ where }),
		]);
		return this.db.getPagOutput({
			total: count,
			page: dto.page,
			size: dto.size,
			data: data.map((s) => new ServiceTypeDto(s)),
		});
	}

	async findOne(id: number) {
		const service = await this.db.serviceType.findUnique({
			where: { id },
			...this.getInclude(),
		});
		if (!service) throw new NotFoundException('Servicio no encontrado');
		return new ServiceTypeDto(service);
	}

	async update(id: number, dto: CreateServiceTypeDto) {
		const prevST = await this.db.serviceType.findFirst({
			...this.getInclude(),
			where: { id },
		});

		if (!prevST) throw new NotFoundException('Servicio no encontrado');

		const { img, tags, price, cost, iva, ...data } = dto;

		const newImg = img
			? await this.imgService.upsert(prevST?.product.image, img)
			: null;

		const prevTags = prevST.product.tags;

		const isSamePrice = price && prevST.product.prices[0].amount.eq(price);
		const isSameCost = cost && prevST.product.costs[0].cost.eq(cost);

		const serviceType = await this.db.$transaction(
			async (tx) => {
				if (!isSameCost)
					this.productPricingService.resetProductCostHistory(
						tx,
						prevST.productId,
					);

				if (!isSamePrice)
					this.productPricingService.resetProductPriceHistory(
						tx,
						prevST.productId,
					);

				return await this.db.serviceType.update({
					...this.getInclude(),
					where: { id },
					data: {
						...data,
						product: {
							update: {
								data: {
									tags: tags
										? this.tagService.handleUpdateTags(prevTags, tags)
										: undefined,
									image: newImg ? { connect: { id: newImg.id } } : undefined,
									prices: !isSamePrice
										? { create: { amount: new Decimal(price) } }
										: undefined,
									costs: !isSameCost
										? { create: { cost: new Decimal(cost) } }
										: undefined,
									name: data.name,
									iva: iva,
								},
							},
						},
					},
				});
			},
			{ timeout: 15000 },
		);
		return new ServiceTypeDto(serviceType);
	}

	async remove(id: number) {
		const serviceType = await this.db.serviceType.findUnique({
			where: { id },
			select: { id: true, productId: true },
		});
		if (!serviceType) throw new NotFoundException('Servicio no encontrado');

		const product = await this.db.product.findUnique({
			where: { id: serviceType.productId },
			select: { id: true },
		});
		if (product) await this.db.product.softDelete({ id: product.id });
		await this.db.serviceType.softDelete({ id });
	}

	private getInclude() {
		return {
			include: {
				product: {
					include: {
						image: true,
						provider: true,
						prices: { where: { isActive: true } },
						costs: { where: { isActive: true } },
						tags: { include: { tag: true } },
					},
				},
			},
		};
	}

	private applyFilters(dto: ServiceTypeQueryDto) {
		const { baseWhere } = this.db.getBaseWhere(dto);
		const where: Prisma.ServiceTypeWhereInput = {
			...baseWhere,
			name: dto.name,
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
		return where;
	}
}
