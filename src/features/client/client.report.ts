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
		const totalClients = await this.db.client.count();
		const clientsInRange = await this.db.client.findMany({
			take: 500,
			where: this.getRanges(query),
			include: {
				user: true,
				invoices: true,
			},
		});

		if (clientsInRange.length === 0) {
			throw new NotFoundException(
				'No se encontraron clientes para ese rango de fechas',
			);
		}

		const newClients = clientsInRange.length;

		const topClients = [...clientsInRange]
			.map((client) => {
				const total = client.invoices.reduce((sum, i) => {
					return sum + Number(i.total ?? 0);
				}, 0);

				const validTotal = isNaN(total) ? 0 : total;

				return {
					...client,
					total: validTotal,
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
					alwaysShowHeader: true,
					header: [
						'Nombre',
						'Email',
						'Teléfono',
						'RUC',
						'Ingresos (Gs)',
						'Fecha Registro',
					],
					data: clientsInRange.map((c) => {
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
					widths: [25, 25, 15, 15, 15, 15],
				},
			},
			res,
		);
	}

	private getRanges(query: ClientReportQueryDto) {
		return {
			createdAt: {
				gte: new Date(query.from),
				lte: new Date(query.to),
			},
		};
	}
}
