import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateServiceTypeDto } from './dto/create-service-type.dto';
import { UpdateServiceTypeDto } from './dto/update-service-type.dto';
import { PrismaService } from '@features/prisma/prisma.service';
import { ServiceTypeQueryDto } from './dto/service-type-query.dto';
import { ImageService } from '@features/media-module/image/image.service';
import { TagService } from '@features/product-module/tag/tag.service';
import Decimal from 'decimal.js';
import { genRandomCode } from '@lib/utils/encrypt';
import { ServiceTypeDto } from './dto/service-type.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ServiceTypeService {
	constructor(
		private readonly db: PrismaService,
		private readonly tagService: TagService,
		private readonly imgService: ImageService,
	) {}

	async create(dto: CreateServiceTypeDto) {
		const { img, tags, price, iva, ...data } = dto;
		const newImg = img ? await this.imgService.create(img) : null;
		const serviceType = await this.db.serviceType.create({
			...this.getInclude(),
			data: {
				...data,
				product: {
					create: {
						image: newImg ? { connect: { id: newImg.id } } : undefined,
						price: { create: { amount: new Decimal(price) } },
						tags: this.tagService.connectTags(tags),
						code: genRandomCode(),
						category: 'SERVICE',
						name: data.name,
						iva: iva,
						cost: 0,
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

	async update(id: number, dto: UpdateServiceTypeDto) {
		const prevST = await this.db.serviceType.findFirst({
			where: { id },
			include: {
				product: { include: { image: true, tags: { include: { tag: true } } } },
			},
		});

		if (!prevST) throw new NotFoundException('Servicio no encontrado');

		const { img, tags, price, iva, ...data } = dto;

		const newImg = img
			? await this.imgService.upsert(prevST?.product.image, img)
			: null;

		const prevTags = prevST.product.tags;

		const serviceType = await this.db.serviceType.update({
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
							price: price ? { create: { amount: price } } : undefined,
							name: data.name,
							iva: iva,
						},
					},
				},
			},
		});
		return new ServiceTypeDto(serviceType);
	}

	async remove(id: number) {
		const serviceType = await this.db.serviceType.findUnique({
			where: { id },
			select: { id: true },
		});
		if (!serviceType) throw new NotFoundException('Servicio no encontrado');

		const product = await this.db.product.findUnique({
			where: { id: serviceType.id },
			select: { id: true },
		});
		if (!product) throw new NotFoundException('Producto no encontrado');

		await this.db.product.softDelete({ id: product.id });
		await this.db.serviceType.softDelete({ id });
	}

	private getInclude() {
		return {
			include: {
				product: {
					include: {
						image: true,
						price: true,
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
				price:
					dto.minPrice || dto.maxPrice
						? { amount: { gte: dto.minPrice, lte: dto.maxPrice } }
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
