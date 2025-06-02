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
import { Prisma } from '@prisma/client';

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

		const topClients = await this.db.$queryRaw<
			{
				fullName: string;
				ruc: string;
				email: string;
				phoneNumber: string;
				totalIngreso: number;
				ultimaFacturacion: string;
			}[]
		>(Prisma.sql`
SELECT  
	u."fullName"                        AS "fullName", 
	u."ruc"                             AS "ruc", 
	u."email"                           AS "email",
	u."phoneNumber"                     AS "phoneNumber",
	COALESCE(SUM(i."totalPayed"), 0::money)    AS "totalIngreso", 
	MAX(i."issueDate")                 AS "ultimaFacturacion"
FROM "Invoice" i 
	JOIN "Client"  c ON c.id = i."clientId" 
	JOIN "User"    u ON u.id = c."userId" 
WHERE i."issueDate" BETWEEN ${query.from}::date AND ${query.to}::date 
GROUP BY u."fullName", u."ruc", u."email", u."phoneNumber"
HAVING SUM(i."totalPayed")::numeric > 0
ORDER BY "totalIngreso" DESC 
LIMIT 10;
`);

		if (topClients.length === 0) {
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
				subtitle: 'Clientes que mas compraron',
				rowConfig: {
					parentRowSpacing: 5,
					alwaysShowHeader: false,
					header: [
						'Nombre',
						'Email',
						'Teléfono',
						'RUC',
						'Ingresos (Gs)',
						'Ultima Facturación',
					],
					data: topClients.map((c) => ({
						values: [
							c.fullName,
							c.email,
							c.phoneNumber,
							c.ruc,
							Number(c.totalIngreso).toLocaleString(),
							toDateFormat(c.ultimaFacturacion),
						],
					})),
					widths: [15, 20, 15, 10, 10, 12],
				},
			},
			res,
		);
	}
}
