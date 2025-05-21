import { PrismaService } from '@features/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ReceiptQueryDto } from './dto/receipt-query.dto';
import { ReceiptMapper } from './receipt.mapper';
import { ReceiptFilter } from './receipt.filter';

@Injectable()
export class ReceiptService {
	constructor(private readonly db: PrismaService) {}

	async findAll(query: ReceiptQueryDto) {
		const { baseWhere } = this.db.getBaseWhere(query);
		const where = ReceiptFilter.getWhere(baseWhere, query);
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
			data: data.map((r) => ReceiptMapper.toDto(r)),
		});
	}

	async findOne(id: number) {
		const receipt = await this.db.receipt.findUnique({
			...this.getInclude(),
			where: { id },
		});
		if (!receipt) throw new NotFoundException('El recibo no fue encontrado');
		return ReceiptMapper.toDto(receipt);
	}

	private getInclude() {
		return { include: { paymentMethods: { include: { method: true } } } };
	}
}
