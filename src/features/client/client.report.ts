import { Injectable, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { ClientReportQueryDto } from './dto/client-report-query.dto';
import { TokenPayload } from '@features/auth-module/auth/types/auth.types';
import { PrismaService } from '@features/prisma/prisma.service';
import { PdfService } from '@features/global-module/pdf/pdf.service';
import { toDateFormat } from '@lib/utils/date';
import { ColorUtils } from '@lib/utils/color-utils';
import { IReport } from '@lib/interfaces/report.interface';
import {
	SummaryItem,
	ReportChartConfig,
} from '@features/global-module/pdf/pdf.types';

@Injectable()
export class ClientReport implements IReport<ClientReportQueryDto> {
	constructor(
		private readonly db: PrismaService,
		private readonly pdfService: PdfService,
	) {}

	async getReport(
		query: ClientReportQueryDto,
		user: TokenPayload,
		res: Response,
	) {
		const fromDate = new Date(query.from);
		const toDate = new Date(query.to);

		// Total de clientes en el sistema
		const totalClients = await this.db.client.count();

		// Clientes nuevos dentro del rango
		const newClientsRaw = await this.db.client.findMany({
			where: {
				createdAt: {
					gte: fromDate,
					lte: toDate,
				},
			},
		});
		const newClients = newClientsRaw.length;

		// Clientes con facturas dentro del rango
		const allClients = await this.db.client.findMany({
			take: 500,
			include: {
				user: true,
				invoices: {
					where: {
						createdAt: {
							gte: fromDate,
							lte: toDate,
						},
					},
				},
			},
		});

		const clientsWithInvoices = allClients
			.map((client) => {
				const total = client.invoices.reduce(
					(sum, i) => sum + Number(i.total ?? 0),
					0,
				);
				return {
					...client,
					total: isNaN(total) ? 0 : total,
				};
			})
			.filter((c) => c.total > 0)
			.sort((a, b) => b.total - a.total)
			.slice(0, 10); // Solo top 10

		if (clientsWithInvoices.length === 0) {
			throw new NotFoundException(
				'No se encontraron clientes con ingresos en este rango de fechas',
			);
		}

		const summaryItems: SummaryItem[] = [
			{
				key: 'Rango de fechas',
				value: `${toDateFormat(query.from)} a ${toDateFormat(query.to)}`,
				desc: 'Rango de fechas del reporte',
			},
			{
				key: 'Total de Clientes',
				value: totalClients.toString(),
				desc: 'Total de clientes registrados en el sistema',
			},
			{
				key: 'Clientes nuevos',
				value: newClients.toString(),
				desc: 'Clientes creados dentro del rango de fechas',
			},
		];

		// Gráfico de evolución de nuevos clientes por mes
		const groupedByMonth: Record<string, number> = {};
		for (const client of newClientsRaw) {
			const date = new Date(client.createdAt);
			const key = `${date.getFullYear()}-${(date.getMonth() + 1)
				.toString()
				.padStart(2, '0')}`;
			groupedByMonth[key] = (groupedByMonth[key] || 0) + 1;
		}

		const sortedMonths = Object.keys(groupedByMonth).sort();
		const chartColors = ColorUtils.getManyRanHexColor(sortedMonths.length);
		const charts: ReportChartConfig[] = [
			{
				title: 'Clientes nuevos por mes',
				type: 'line',
				components: sortedMonths.map((month, i) => ({
					label: month,
					value: groupedByMonth[month],
					color: chartColors[i],
				})),
			},
		];

		return this.pdfService.generateCompactTablePDF(
			{
				title: 'Reporte de Clientes',
				madeBy: `${user.fullName} con RUC: ${user.ruc}`,
				summary: summaryItems,
				charts,
				rowConfig: {
					parentRowSpacing: 10,
					alwaysShowHeader: false,
					header: [
						'Nombre',
						'Email',
						'Teléfono',
						'RUC',
						'Ingresos (Gs)',
						'Fecha Registro',
					],
					data: clientsWithInvoices.map((c) => ({
						values: [
							c.user.fullName,
							c.user.email,
							c.user.phoneNumber,
							c.user.ruc,
							c.total.toLocaleString(),
							toDateFormat(c.createdAt),
						],
					})),
					widths: [25, 25, 10, 15, 15, 15],
				},
			},
			res,
		);
	}
}
