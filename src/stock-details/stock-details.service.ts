import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStockDetailsDto } from './dto/create-stock-detail.dto';
import { UpdateStockDetailsDto } from './dto/update-stock-detail.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { StockDetailsQueryDto } from './dto/stock-details-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class StockDetailsService {
	constructor(private prisma: PrismaService) {}

	async create(dto: CreateStockDetailsDto) {
		const stockDetail = await this.prisma.stock.findUnique({
			where: { id: dto.stockId, deletedAt: null },
		});
		if (!stockDetail) {
			throw new NotFoundException(
				`Detalle deposito con ID ${dto.stockId} no existe o fue eliminada`,
			);
		}
		return this.prisma.stockDetails.create({
			data: dto,
		});
	}

	async findAll(dto: StockDetailsQueryDto) {
		const { baseWhere } = this.prisma.getBaseWhere(dto);
		const where: Prisma.StockDetailsWhereInput = {
			...baseWhere,
			stockId: dto.stockId,
			productId: dto.productId,
		};
		const [data, total] = await Promise.all([
			this.prisma.stockDetails.findMany({
				...this.prisma.paginate(dto),
				where,
			}),
			this.prisma.stockDetails.count({ where }),
		]);
		return this.prisma.getPagOutput({
			page: dto.page,
			size: dto.size,
			total,
			data,
		});
	}

	async findOne(id: number) {
		const stockDetails = await this.prisma.stockDetails.findUnique({
			where: { id, deletedAt: null },
			include: {
				product: true,
				stock: true,
			},
		});
		if (!stockDetails) {
			throw new NotFoundException(
				`Detalle deposito con id ${id} no encontrada`,
			);
		}
		return stockDetails;
	}

	async update(id: number, dto: UpdateStockDetailsDto) {
		try {
			const stockDetails = await this.prisma.stockDetails.update({
				where: { id, deletedAt: null },
				data: dto,
			});
			return stockDetails;
		} catch (error) {
			if (
				error instanceof Prisma.PrismaClientKnownRequestError &&
				error.code === 'P2025'
			) {
				throw new NotFoundException(
					`Detalle deposito con id ${id} no encontrada`,
				);
			}
			throw new Error(
				`Error actualizando detalle deposito con id ${id}: ${error.message}`,
			);
		}
	}

	async remove(id: number) {
		const exists = await this.prisma.stockDetails.isExists({ id });
		if (!exists) throw new NotFoundException('stock no encontrado');
		await this.prisma.stock.softDelete({ id });
	}
}
