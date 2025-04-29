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
			include: {
				product: {
					include: {
						prices: { where: { isActive: true } },
						costs: { where: { isActive: true } },
						image: true,
					},
				},
			},
			where: { id },
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
			include: {
				product: {
					include: {
						prices: { where: { isActive: true } },
						costs: { where: { isActive: true } },
						image: true,
					},
				},
			},
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
		const { baseWhere } = this.prisma.getBaseWhere(dto);
		const where: Prisma.StockDetailsWhereInput = {
			...baseWhere,
			stockId: dto.stockId,
			productId: dto.productId,
			amount:
				dto.fromAmount || dto.toAmount
					? { gte: dto.fromAmount, lte: dto.toAmount }
					: undefined,
		};
		return await Promise.all([
			this.prisma.stockDetails.findMany({
				include: {
					product: {
						include: {
							prices: { where: { isActive: true } },
							costs: { where: { isActive: true } },
							image: true,
						},
					},
				},
				...this.prisma.paginate(dto),
				where,
			}),
			this.prisma.stockDetails.count({ where }),
		]);
	}
}
