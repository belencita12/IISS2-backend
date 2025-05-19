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
		const newClients = await this.db.client.count({
			where: {
				createdAt: {
					gte: fromDate,
					lte: toDate,
				},
			},
		});

		// Clientes con sus facturas dentro del rango para mostrar en el reporte
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

		// Top 10 clientes por ingresos
		const clientsWithInvoices = allClients.filter((c) => c.invoices.length > 0);

		if (clientsWithInvoices.length === 0) {
			throw new NotFoundException(
				'No se encontraron clientes con ingresos en este rango de fechas',
			);
		}

		const topClients = [...clientsWithInvoices]
			.map((client) => {
				const total = client.invoices.reduce((sum, i) => {
					return sum + Number(i.total ?? 0);
				}, 0);
				return {
					...client,
					total: isNaN(total) ? 0 : total,
				};
			})
			.sort((a, b) => b.total - a.total)
			.slice(0, 10);

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

		if (topClients.every((c) => c.total === 0)) {
			summaryItems.push({
				key: 'Ingresos',
				value: 'Sin ingresos en este periodo',
				desc: 'No se generaron ingresos registrados',
			});
		}

		const chartColors = ColorUtils.getManyRanHexColor(topClients.length);

		const chartConfigs: ReportChartConfig[] = [
			{
				title: 'Top 10 clientes por ingresos',
				type: 'bar',
				components: topClients.map((c, i) => ({
					label: `${c.user.fullName} (${c.user.ruc})`,
					value: c.total,
					color: chartColors[i],
				})),
			},
		];

		return this.pdfService.generateCompactTablePDF(
			{
				title: 'Reporte de Clientes',
				madeBy: `${user.fullName} con RUC: ${user.ruc}`,
				summary: summaryItems,
				charts: chartConfigs,
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
					data: allClients.map((c) => {
						const total = c.invoices.reduce((sum, i) => {
							return sum + Number(i.total ?? 0);
						}, 0);
						const validTotal = isNaN(total) ? 0 : total;

						return {
							values: [
								c.user.fullName,
								c.user.email,
								c.user.phoneNumber,
								c.user.ruc,
								validTotal.toLocaleString(),
								toDateFormat(c.createdAt),
							],
						};
					}),
					widths: [25, 25, 10, 10, 10, 10],
				},
			},
			res,
		);
	}
}
