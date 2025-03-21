import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { StockDto } from './dto/stock.dto';
import { StockQueryDto } from './dto/stock-query.dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@features/prisma/prisma.service';

@Injectable()
export class StockService {
	constructor(private prisma: PrismaService) {}

	async create(dto: CreateStockDto) {
		return this.prisma.stock.create({
			data: dto,
		});
	}

	async findAll(query: StockQueryDto) {
		const { baseWhere } = this.prisma.getBaseWhere(query);
		const where: Prisma.StockWhereInput = {
			...baseWhere,
			...(query.name !== undefined && {
				name: {
					contains: query.name,
					mode: 'insensitive',
				},
			}),
			...(query.address !== undefined && {
				address: {
					contains: query.address,
					mode: 'insensitive',
				},
			}),
		};

		const [data, total] = await Promise.all([
			this.prisma.stock.findMany({
				...this.prisma.paginate(query),
				where,
			}),
			this.prisma.stock.count({ where }),
		]);

		return this.prisma.getPagOutput({
			page: query.page,
			size: query.size,
			total,
			data,
		});
	}

	async findOne(id: number) {
		const stock = await this.prisma.stock.findUnique({
			where: { id, deletedAt: null },
		});
		if (!stock) throw new NotFoundException(`Stock con ID ${id} no encontrado`);
		return new StockDto(stock);
	}

	async update(id: number, dto: UpdateStockDto) {
		try {
			const stock = await this.prisma.stock.update({
				where: { id, deletedAt: null },
				data: dto,
			});
			return stock;
		} catch (error) {
			if (
				error instanceof Prisma.PrismaClientKnownRequestError &&
				error.code === 'P2025'
			) {
				throw new NotFoundException(`Deposito con id ${id} no encontrada`);
			}
			throw new Error(
				`Error actualizando deposito con id ${id}: ${error.message}`,
			);
		}
	}

	async remove(id: number) {
		const exists = await this.prisma.stock.isExists({ id });
		if (!exists) throw new NotFoundException('Deposito no encontrado');
		await this.prisma.stock.softDelete({ id });
	}
}
