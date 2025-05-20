import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { StockDto } from './dto/stock.dto';
import { StockQueryDto } from './dto/stock-query.dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@features/prisma/prisma.service';
import { StampedService } from '@features/invoice-module/stamped/stamped.service';

@Injectable()
export class StockService {
	constructor(
		private readonly db: PrismaService,
		private readonly stampedService: StampedService,
	) {}

	async create(dto: CreateStockDto) {
		const stock = await this.db.stock.create({
			include: { stamped: { where: { isActive: true } } },
			data: dto,
		});
		return new StockDto(stock);
	}

	async findAll(query: StockQueryDto) {
		const where = this.getFindAllWhere(query);
		const [data, total] = await Promise.all([
			this.db.stock.findMany({
				...this.db.paginate(query),
				include: { stamped: { where: { isActive: true } } },
				where,
			}),
			this.db.stock.count({ where }),
		]);
		return this.db.getPagOutput({
			page: query.page,
			size: query.size,
			total,
			data: data.map((s) => new StockDto(s)),
		});
	}

	async findOne(id: number) {
		const stock = await this.db.stock.findUnique({
			include: { stamped: { where: { isActive: true } } },
			where: { id },
		});
		if (!stock) throw new NotFoundException('Deposito no encontrado');
		return new StockDto(stock);
	}

	async update(id: number, dto: UpdateStockDto) {
		const exists = await this.db.stock.isExists({ id });
		if (!exists) throw new NotFoundException('Deposito no encontrado');
		const stock = await this.db.stock.update({
			where: { id, deletedAt: null },
			include: { stamped: { where: { isActive: true } } },
			data: dto,
		});
		return stock;
	}

	async remove(id: number) {
		const stock = await this.db.stock.findUnique({
			where: { id },
			select: { id: true },
		});
		if (!stock) throw new NotFoundException('Deposito no encontrado');
		return await this.db.$transaction(async (tx) => {
			await tx.stock.softDelete({ id });
			await tx.stockDetails.updateMany({
				where: { stockId: stock.id },
				data: { deletedAt: new Date() },
			});
		});
	}

	private getFindAllWhere(query: StockQueryDto) {
		const { baseWhere } = this.db.getBaseWhere(query);
		const where: Prisma.StockWhereInput = {
			...baseWhere,
			...(query.name !== undefined && {
				name: { contains: query.name, mode: 'insensitive' },
			}),
			...(query.address !== undefined && {
				address: { contains: query.address, mode: 'insensitive' },
			}),
			...(query.stamped !== undefined && {
				stamped: {
					some: { stampedNum: { contains: query.name, mode: 'insensitive' } },
				},
			}),
		};
		return where;
	}
}
