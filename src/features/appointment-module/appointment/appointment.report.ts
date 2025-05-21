import { Response } from 'express';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@features/prisma/prisma.service';
import { PdfService } from '@features/global-module/pdf/pdf.service';
import { TokenPayload } from '@features/auth-module/auth/types/auth.types';
import { IReport } from '@lib/interfaces/report.interface';
import { toDateFormat } from '@lib/utils/date';
import {
	ReportChartConfig,
	SummaryItem,
} from '@features/global-module/pdf/pdf.types';
import { ColorUtils } from '@lib/utils/color-utils';
import { AppointmentReportQueryDto } from './dto/appointment-report-query.dto';
import { AppointmentStatus } from '@prisma/client';

@Injectable()
export class AppointmentReport implements IReport<AppointmentReportQueryDto> {
	constructor(
		private readonly db: PrismaService,
		private readonly pdfService: PdfService,
	) {}

	async getReport(
		query: AppointmentReportQueryDto,
		user: TokenPayload,
		response: Response,
	) {
		const appointments = await this.db.appointment.findMany({
			where: {
				designatedDate: {
					gte: new Date(query.from),
					lte: new Date(query.to),
				},
				status: {
					in: [
						AppointmentStatus.PENDING,
						AppointmentStatus.COMPLETED,
						AppointmentStatus.CANCELLED,
					],
				},
			},
			include: {
				pet: {
					select: {
						name: true,
						client: {
							select: {
								user: {
									select: {
										fullName: true,
									},
								},
							},
						},
					},
				},
				employee: {
					select: {
						user: {
							select: {
								fullName: true,
								ruc: true,
							},
						},
					},
				},
			},
			orderBy: {
				designatedDate: 'asc',
			},
		});

		if (appointments.length === 0) {
			throw new NotFoundException(
				'No se encontraron citas en el rango de fechas especificado.',
			);
		}

		const [summaryItems, chartConfigs] = this.generateSummaryData(
			query,
			appointments,
		);
		return this.pdfService.generateCompactTablePDF(
			{
				title: 'Reporte de Citas',
				madeBy: `${user.fullName} con RUC: ${user.ruc}`,
				charts: chartConfigs,
				summary: summaryItems,
				rowConfig: {
					header: [
						'Fecha',
						'Hora',
						'Mascota',
						'Veterinario',
						'Cliente',
						'Estado',
					],
					data: appointments.map((a) => ({
						values: [
							toDateFormat(a.designatedDate),
							a.designatedDate.toLocaleTimeString('es-PE', {
								hour: '2-digit',
								minute: '2-digit',
								hour12: false,
							}),
							a.pet.name,
							a.employee.user.fullName,
							a.pet.client.user.fullName,
							this.translateStatus(a.status),
						],
					})),
					widths: [15, 10, 10, 25, 30, 10],
				},
			},
			response,
		);
	}

	private translateStatus(status: string): string {
		const statusMap: { [key: string]: string } = {
			PENDING: 'Pendiente',
			COMPLETED: 'Finalizada',
			CANCELLED: 'Cancelada',
		};
		return statusMap[status] || 'Desconocido';
	}

	private generateSummaryData(
		query: AppointmentReportQueryDto,
		appointments: any[],
	): [SummaryItem[], ReportChartConfig[]] {
		const colors = ColorUtils.getManyRanHexColor(7);
		const totalAppointments = appointments.length;

		const validStatuses = ['PENDING', 'COMPLETED', 'CANCELLED'];
		const statusCounts: { [key: string]: number } = {};
		appointments.forEach((a) => {
			if (validStatuses.includes(a.status)) {
				statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
			}
		});

		const vetCounts: { [key: string]: number } = {};
		appointments.forEach((a) => {
			const name = a.employee.user.fullName;
			vetCounts[name] = (vetCounts[name] || 0) + 1;
		});
		const topVets = Object.entries(vetCounts)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 5);

		const clientCounts: { [key: string]: number } = {};
		appointments.forEach((a) => {
			const name = a.pet.client.user.fullName;
			clientCounts[name] = (clientCounts[name] || 0) + 1;
		});
		const topClients = Object.entries(clientCounts)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 5);

		const dayCounts: { [key: string]: number } = {};
		appointments.forEach((a) => {
			const dateStr = toDateFormat(a.designatedDate);
			dayCounts[dateStr] = (dayCounts[dateStr] || 0) + 1;
		});

		const avgPerDay = (
			totalAppointments / Object.keys(dayCounts).length
		).toFixed(2);

		const canceled = statusCounts['CANCELLED'] || 0;
		const cancelRate = ((canceled / totalAppointments) * 100).toFixed(2) + '%';

		const topDays = Object.entries(dayCounts)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 3);

		const summaryItems: SummaryItem[] = [
			{
				key: 'Rango de fechas',
				value: `${toDateFormat(query.from)} a ${toDateFormat(query.to)}`,
			},
			{
				key: 'Total de citas',
				value: totalAppointments.toString(),
				desc: 'Cantidad de citas totales',
			},
			{
				key: 'Promedio por día',
				value: avgPerDay,
				desc: 'Promedio de citas realizadas por día',
			},
			{
				key: 'Tasa de cancelación',
				value: cancelRate,
				desc: 'Porcentaje de citas canceladas',
			},
			{
				key: 'Top 5 Veterinarios',
				value: '',
				desc: 'Ranking de veterinarios con más citas',
			},
			...topVets.map(([name, count]) => ({
				key: `\u00A0\u00A0${name}`,
				value: count.toString(),
			})),
			{
				key: 'Top 5 Clientes',
				value: '',
				desc: 'Ranking de clientes con más citas solicitadas',
			},
			...topClients.map(([name, count]) => ({
				key: `\u00A0\u00A0${name}`,
				value: count.toString(),
			})),
			{
				key: 'Días con más citas',
				value: '',
				desc: 'Ranking de fechas en las que se registraron mayor cantidad de citas',
			},
			...topDays.map(([date, count]) => ({
				key: `\u00A0\u00A0${date}`,
				value: count.toString(),
			})),
		];

		const statusChart: ReportChartConfig = {
			title: 'Distribución de citas por estado',
			type: 'pie',
			components: Object.entries(statusCounts).map(
				([status, count], index) => ({
					label: this.translateStatus(status),
					value: count,
					color: colors[index % colors.length],
				}),
			),
		};

		const topDaysChart: ReportChartConfig = {
			title: 'Top 3 días con más citas',
			type: 'bar',
			components: topDays.map(([date, count], index) => ({
				label: date,
				value: count,
				color: colors[index % colors.length],
			})),
		};

		return [summaryItems, [statusChart, topDaysChart]];
	}
}
