import { PdfService } from '@features/global-module/pdf/pdf.service';
import { PrismaService } from '@features/prisma/prisma.service';
import { IReport } from '@lib/interfaces/report.interface';
import { Injectable, NotFoundException } from '@nestjs/common';
import { TokenPayload } from '@features/auth-module/auth/types/auth.types';
import { Prisma } from '@prisma/client';
import { Response } from 'express';
import {
	ReportChartConfig,
	SummaryItem,
} from '@features/global-module/pdf/pdf.types';
import { ColorUtils } from '@lib/utils/color-utils';
import { toDateFormat } from '@lib/utils/date';
import { InvoiceReportQueryDto } from '../dto/invoice-report-query.dto';

@Injectable()
export class InvoiceReport implements IReport<InvoiceReportQueryDto> {
	constructor(
		private readonly db: PrismaService,
		private readonly pdfService: PdfService,
	) {}

	async getReport(
		query: InvoiceReportQueryDto,
		user: TokenPayload,
		response: Response,
	) {
		const invoices = await this.db.invoice.findMany({
			...this.getSelect(),
			where: { ...this.getRanges(query) },
		});
		const [summaryItems, chartConfigs] = await this.generateSummaryData(query);

		return this.pdfService.generateCompactTablePDF(
			{
				title: 'Reporte de Facturas',
				madeBy: `${user.fullName} con RUC: ${user.ruc}`,
				summary: summaryItems,
				charts: chartConfigs,
				rowConfig: {
					parentRowSpacing: 12,
					alwaysShowHeader: true,
					header: [
						'Cliente',
						'RUC',
						'N° Factura',
						'Tipo',
						'Fecha',
						'Total',
						'Pagado',
						'Pendiente',
					],
					data: invoices.map((i) => ({
						values: [
							i.client.user.fullName,
							i.client.user.ruc,
							i.invoiceNumber,
							i.type,
							i.issueDate.toISOString().split('T')[0],
							i.total.toNumber().toLocaleString(),
							i.totalPayed.toNumber().toLocaleString(),
							i.total.minus(i.totalPayed).toNumber().toLocaleString(),
						],
					})),
					widths: [28, 14, 14, 8, 12, 10, 7, 7],
				},
			},
			response,
		);
	}

	private async generateSummaryData(
		query: InvoiceReportQueryDto,
	): Promise<[SummaryItem[], ReportChartConfig[]]> {
		const colors = ColorUtils.getManyRanHexColor(7);

		const totalInvoices = await this.db.invoice.count({
			where: { ...this.getRanges(query) },
		});

		if (totalInvoices === 0) {
			throw new NotFoundException(
				'Los datos son insuficientes para generar un reporte',
			);
		}

		const [amountSummary, statusChart, typeChart, topClientsChart] =
			await Promise.all([
				this.genAmountSummary(query),
				this.genPaidPendingChart(query, colors.slice(0, 2)),
				this.genInvoiceTypeChart(query, colors.slice(2, 5)),
				this.genTopClientsChart(query, colors.slice(5)),
			]);

		const summaryItems: SummaryItem[] = [
			{
				key: 'Rango de fechas',
				value: `${toDateFormat(query.from)} a ${toDateFormat(query.to)}`,
				desc: 'Rango de fechas seleccionado',
			},
			...amountSummary,
		];

		const chartConfigs: ReportChartConfig[] = [
			statusChart,
			typeChart,
			topClientsChart,
		];

		return [summaryItems, chartConfigs];
	}

	private async genAmountSummary(
		query: InvoiceReportQueryDto,
	): Promise<SummaryItem[]> {
		const result = await this.db.invoice.aggregate({
			_count: { _all: true },
			_sum: { total: true, totalPayed: true },
			where: { ...this.getRanges(query) },
		});

		const total = result._sum.total?.toNumber() ?? 0;
		const payed = result._sum.totalPayed?.toNumber() ?? 0;
		const pending = total - payed;

		return [
			{
				key: 'Total de facturas',
				value: result._count._all.toString(),
				desc: 'Cantidad de facturas encontradas bajo los filtros',
			},
			{
				key: 'Monto total',
				value: `Gs. ${total.toLocaleString()}`,
				desc: 'Suma de los totales de todas las facturas',
			},
			{
				key: 'Monto pagado',
				value: `Gs. ${payed.toLocaleString()}`,
				desc: 'Suma pagada de las facturas',
			},
			{
				key: 'Monto pendiente',
				value: `Gs. ${pending.toLocaleString()}`,
				desc: 'Diferencia entre total y pagado',
			},
		];
	}

	private async genPaidPendingChart(
		query: InvoiceReportQueryDto,
		colors: string[],
	): Promise<ReportChartConfig> {
		const invoices = await this.db.invoice.findMany({
			where: { ...this.getRanges(query) },
			select: { total: true, totalPayed: true },
		});

		let paidCount = 0;
		let unpaidCount = 0;

		for (const inv of invoices) {
			const total = inv.total?.toNumber() ?? 0;
			const payed = inv.totalPayed?.toNumber() ?? 0;

			if (payed >= total) paidCount++;
			else unpaidCount++;
		}

		return {
			title: 'Facturas Pagadas / Pendientes',
			type: 'pie',
			components: [
				{ label: 'Pagadas', value: paidCount, color: colors[0] },
				{ label: 'Pendientes', value: unpaidCount, color: colors[1] },
			],
		};
	}

	private async genInvoiceTypeChart(
		query: InvoiceReportQueryDto,
		colors: string[],
	): Promise<ReportChartConfig> {
		const types = await this.db.invoice.groupBy({
			by: ['type'],
			_count: { _all: true },
			where: { ...this.getRanges(query) },
		});

		return {
			title: 'Facturas por tipo',
			type: 'pie',
			components: types.map((t, i) => ({
				label: t.type,
				value: t._count._all,
				color: colors[i % colors.length],
			})),
		};
	}

	private async genTopClientsChart(
		query: InvoiceReportQueryDto,
		colors: string[],
	): Promise<ReportChartConfig> {
		const results = await this.db.$queryRaw<
			{
				clientName: string;
				total: number;
			}[]
		>(Prisma.sql`
      SELECT 
        u."fullName"  AS "clientName",
        SUM(i.total)  AS "total"
      FROM "Invoice" i
      JOIN "Client"  c ON c.id = i."clientId"
      JOIN "User"    u ON u.id = c."userId"
       WHERE i."issueDate" BETWEEN ${query.from}::date AND ${query.to}::date
      GROUP BY u."fullName"
      ORDER BY total DESC
      LIMIT 5;
    `);
		return {
			title: 'Top clientes por monto total',
			type: 'bar',
			components: results.map((r, idx) => ({
				label: r.clientName,
				value: Number(r.total),
				color: colors[idx % colors.length],
			})),
		};
	}

	private getRanges(query: InvoiceReportQueryDto): Prisma.InvoiceWhereInput {
		const where: Prisma.InvoiceWhereInput = {
			issueDate: {
				gte: new Date(query.from),
				lte: new Date(query.to),
			},
		};
		if (query.fromTotal !== undefined || query.toTotal !== undefined) {
			where.total = {};
			if (query.fromTotal !== undefined) {
				where.total.gte = query.fromTotal;
			}
			if (query.toTotal !== undefined) {
				where.total.lte = query.toTotal;
			}
		}
		if (query.search?.trim()) {
			const texto = query.search.trim();
			where.OR = [
				{ invoiceNumber: { contains: texto, mode: 'insensitive' } },
				{
					client: {
						user: { fullName: { contains: texto, mode: 'insensitive' } },
					},
				},
				{ client: { user: { ruc: { contains: texto, mode: 'insensitive' } } } },
			];
		}
		return where;
	}

	private getSelect() {
		return {
			take: 500,
			select: {
				client: {
					select: {
						user: { select: { fullName: true, ruc: true } },
					},
				},
				invoiceNumber: true,
				type: true,
				issueDate: true,
				total: true,
				totalPayed: true,
				totalVat: true,
			},
		};
	}
}
