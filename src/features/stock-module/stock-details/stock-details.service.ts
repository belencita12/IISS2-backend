import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateStockDetailsDto } from './dto/update-stock-detail.dto';
import { StockDetailsQueryDto } from './dto/stock-details-query.dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@features/prisma/prisma.service';
import { StockDetailsDto } from './dto/stock-details.dto';
import { CreateStockDetailsDto } from './dto/create-stock-detail.dto';

@Injectable()
export class StockDetailsService {
	constructor(private prisma: PrismaService) {}

	async create(dto: CreateStockDetailsDto) {
		const isStockExists = await this.prisma.stock.findUnique({
			where: { id: dto.stockId },
		});
		if (!isStockExists) throw new NotFoundException('Deposito no encontrado');
		return this.prisma.stockDetails.create({
			data: dto,
		});
	}

	async findAll(dto: StockDetailsQueryDto) {
		const [data, total] = await this.findManyAndCount(dto);
		return this.prisma.getPagOutput({
			page: dto.page,
			size: dto.size,
			total,
			data: data.map((s) => new StockDetailsDto(s)),
		});
	}

	async findOne(id: number) {
		const stockDetails = await this.prisma.stockDetails.findUnique({
			where: { id },
			...this.getInclude(),
		});
		if (!stockDetails)
			throw new NotFoundException('Detalle del deposito no encontrado');
		return new StockDetailsDto(stockDetails);
	}

	async update(id: number, dto: UpdateStockDetailsDto) {
		if (dto.stockId) {
			const stock = await this.prisma.stock.findUnique({
				where: { id: dto.stockId },
			});
			if (!stock) throw new NotFoundException(`Deposito no encontrado`);
		}

		if (dto.productId) {
			const product = await this.prisma.product.findUnique({
				where: { id: dto.productId },
			});
			if (!product) throw new NotFoundException('Producto no encontrado');
		}

		const stockDetails = await this.prisma.stockDetails.update({
			...this.getInclude(),
			where: { id },
			data: dto,
		});
		return new StockDetailsDto(stockDetails);
	}

	async remove(id: number) {
		const exists = await this.prisma.stockDetails.isExists({ id });
		if (!exists) throw new NotFoundException('Detalle deposito no encontrado');
		await this.prisma.stockDetails.softDelete({ id });
	}

	async findManyAndCount(dto: StockDetailsQueryDto) {
		const where = this.getWhere(dto);
		return await Promise.all([
			this.prisma.stockDetails.findMany({
				...this.getInclude(),
				...this.prisma.paginate(dto),
				where,
			}),
			this.prisma.stockDetails.count({ where }),
		]);
	}

	private getInclude() {
		return {
			include: {
				product: {
					include: {
						prices: { where: { isActive: true } },
						costs: { where: { isActive: true } },
						image: true,
						provider: true,
					},
				},
			},
		};
	}

	private getWhere(query: StockDetailsQueryDto): Prisma.StockDetailsWhereInput {
		const { baseWhere } = this.prisma.getBaseWhere(query);

		const where: Prisma.StockDetailsWhereInput = {
			...baseWhere,
			product: {
				OR: query.productSearch
					? [
							{ name: { contains: query.productSearch, mode: 'insensitive' } },
							{ code: { contains: query.productSearch, mode: 'insensitive' } },
						]
					: undefined,
				category: query.category,
				costs:
					query.minCost || query.maxCost
						? {
								some: {
									isActive: true,
									cost: { gte: query.minCost, lte: query.maxCost },
								},
							}
						: undefined,
				prices:
					query.minPrice || query.maxPrice
						? {
								some: {
									isActive: true,
									amount: { gte: query.minPrice, lte: query.maxPrice },
								},
							}
						: undefined,
				tags: query.tags
					? { some: { tag: { name: { in: query.tags } } } }
					: undefined,
			},
		};

		if (query.stockId) {
			where.stockId = query.stockId;
		}

		if (query.fromAmount || query.toAmount) {
			where.amount =
				query.fromAmount || query.toAmount
					? { gte: query.fromAmount, lte: query.toAmount }
					: undefined;
		}

		return where;
	}
}
