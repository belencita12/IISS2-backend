import { PrismaService } from '@features/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ReceiptQueryDto } from './dto/receipt-query.dto';
import { Prisma } from '@prisma/client';
import { ReceiptDto } from './dto/receipt.dto';

@Injectable()
export class ReceiptService {
	constructor(private readonly db: PrismaService) {}

	async findAll(query: ReceiptQueryDto) {
		const where = this.getFindAllWhere(query);

		const [data, count] = await Promise.all([
			this.db.receipt.findMany({
				...this.db.paginate(query),
				...this.getInclude(),
				where,
			}),
			this.db.receipt.count({ where }),
		]);

		return this.db.getPagOutput({
			page: query.page,
			size: query.size,
			total: count,
			data: data.map((r) => new ReceiptDto(r)),
		});
	}

	async findOne(id: number) {
		const receipt = await this.db.receipt.findUnique({
			...this.getInclude(),
			where: { id },
		});
		if (!receipt) throw new NotFoundException('El recibo no fue encontrado');
		return new ReceiptDto(receipt);
	}

	private getInclude() {
		return { include: { paymentMethods: { include: { method: true } } } };
	}

	private getFindAllWhere(dto: ReceiptQueryDto) {
		const { baseWhere } = this.db.getBaseWhere(dto);
		const where: Prisma.ReceiptWhereInput = { ...baseWhere };

		if (dto.invoiceId) {
			where.invoiceId = dto.invoiceId;
		}

		if (dto.fromTotal || dto.toTotal) {
			where.total = { gte: dto.fromTotal, lte: dto.toTotal };
		}

		return where;
	}
}
