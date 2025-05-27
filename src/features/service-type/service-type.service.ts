import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateServiceTypeDto } from './dto/create-service-type.dto';
import { PrismaService } from '@features/prisma/prisma.service';
import { ServiceTypeQueryDto } from './dto/service-type-query.dto';
import { ImageService } from '@features/media-module/image/image.service';
import { TagService } from '@features/product-module/tag/tag.service';
import Decimal from 'decimal.js';
import { genRandomCode } from '@lib/utils/encrypt';
import { ProductPricingService } from '@features/product-module/product/product-pricing.service';
import { ServiceTypeMapper } from './service-type.mapper';
import { ServiceTypeFilter } from './service-type.filter';
import { TokenPayload } from '@features/auth-module/auth/types/auth.types';

@Injectable()
export class ServiceTypeService {
	constructor(
		private readonly db: PrismaService,
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
		return ServiceTypeMapper.toDto(serviceType);
	}

	async findAll(dto: ServiceTypeQueryDto, user?: TokenPayload) {
		const isPublic = !user || user.clientId !== undefined;
		const { baseWhere } = this.db.getBaseWhere(dto);
		const where = ServiceTypeFilter.getWhere(baseWhere, dto);
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
			data: data.map((s) => ServiceTypeMapper.toDto(s, isPublic)),
		});
	}

	async findOne(id: number, user?: TokenPayload) {
		const isPublic = !user || user.clientId !== undefined;
		const service = await this.db.serviceType.findUnique({
			where: { id },
			...this.getInclude(),
		});
		if (!service) throw new NotFoundException('Servicio no encontrado');
		return ServiceTypeMapper.toDto(service, isPublic);
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
		return ServiceTypeMapper.toDto(serviceType);
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
}
