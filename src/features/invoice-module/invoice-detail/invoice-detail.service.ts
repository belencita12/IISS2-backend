import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@features/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { InvoiceQueryDto } from '../dto/invoice-query.dto';
import { InvoiceDetailDto } from '../dto/invoice-detail.dto';
import { InvoiceDetailQueryDto } from '../dto/invoice-detail-query.dto';

@Injectable()
export class InvoiceDetailService {
	constructor(private readonly db: PrismaService) {}

	async findAll(dto: InvoiceQueryDto) {
		const where = this.applyFilters(dto);
		const [data, count] = await Promise.all([
			this.db.invoiceDetail.findMany({
				...this.getInclude(),
				...this.db.paginate(dto),
				where,
			}),
			this.db.invoiceDetail.count({ where }),
		]);
		return this.db.getPagOutput({
			total: count,
			page: dto.page,
			size: dto.size,
			data: data.map((i) => new InvoiceDetailDto(i)),
		});
	}

	async findOne(id: number) {
		const invoiceDetail = await this.db.invoiceDetail.findUnique({
			...this.getInclude(),
			where: { id },
		});
		if (!invoiceDetail) throw new NotFoundException('Factura no encontrada');
		return new InvoiceDetailDto(invoiceDetail);
	}

	async remove(id: number) {
		const isExists = await this.db.invoiceDetail.isExists({ id });
		if (!isExists)
			throw new NotFoundException('Detalle de Factura no encontrada');
		await this.db.invoiceDetail.softDelete({ id });
	}

	private getInclude() {
		return {
			include: {
				product: {
					include: {
						image: true,
						costs: { where: { isActive: true } },
						prices: { where: { isActive: true } },
						tags: { include: { tag: true } },
					},
				},
			},
		};
	}

	private applyFilters(dto: InvoiceDetailQueryDto) {
		const { baseWhere } = this.db.getBaseWhere(dto);
		const where: Prisma.InvoiceDetailWhereInput = { ...baseWhere };

		if (dto.invoiceId) {
			where.invoiceId = dto.invoiceId;
		}

		if (dto.fromPartialTotal || dto.toPartialTotal) {
			where.partialAmount = {
				...(dto.fromPartialTotal && { gte: dto.fromPartialTotal }),
				...(dto.toPartialTotal && { lte: dto.toPartialTotal }),
			};
		}

		if (dto.fromIssueDate || dto.toIssueDate) {
			where.invoice = {
				...(dto.fromIssueDate !== undefined && {
					issueDate: {
						gte: dto.fromIssueDate ? new Date(dto.fromIssueDate) : undefined,
					},
				}),
				...(dto.toIssueDate !== undefined && {
					issueDate: {
						lte: dto.toIssueDate ? new Date(dto.toIssueDate) : undefined,
					},
				}),
			};
		}

		return where;
	}
}
