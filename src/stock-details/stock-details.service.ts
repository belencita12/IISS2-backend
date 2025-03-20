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
		const stock = await this.prisma.stock.findUnique({
			where: { id: dto.stockId },
		});
		if (!stock) {
			throw new NotFoundException(
				`Stock con ID ${dto.stockId} no existe o fue eliminado`,
			);
		}
		const product = await this.prisma.product.findUnique({
			where: { id: dto.productId, deletedAt: null },
		});
		if (!product) {
			throw new NotFoundException(
				`Producto con ID ${dto.productId} no existe o fue eliminado`,
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
			where: { id },
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
			if (dto.stockId) {
				const stock = await this.prisma.stock.findUnique({
					where: { id: dto.stockId },
				});
				if (!stock) {
					throw new NotFoundException(
						`Stock con ID ${dto.stockId} no existe o fue eliminado`,
					);
				}
			}

			if (dto.productId) {
				const product = await this.prisma.product.findUnique({
					where: { id: dto.productId },
				});
				if (!product) {
					throw new NotFoundException(
						`Producto con ID ${dto.productId} no existe o fue eliminado`,
					);
				}
			}

			const stockDetails = await this.prisma.stockDetails.update({
				where: { id },
				data: dto,
			});
			return stockDetails;
		} catch (error) {
			if (
				error instanceof Prisma.PrismaClientKnownRequestError &&
				error.code === 'P2025'
			) {
				throw new NotFoundException(
					`Detalle deposito con id ${id} no encontrado`,
				);
			}
			if (error instanceof NotFoundException) {
				throw error;
			}
			throw new Error(
				`Error actualizando detalle deposito con id ${id}: ${error.message}`,
			);
		}
	}

	async remove(id: number) {
		const exists = await this.prisma.stockDetails.isExists({ id });
		if (!exists) throw new NotFoundException('Detalle deposito no encontrado');
		await this.prisma.stockDetails.softDelete({ id });
	}
}
