import { Injectable, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { PurchaseReportQueryDto } from './dto/purchase-report-query.dto';
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
export class PurchaseReport implements IReport<PurchaseReportQueryDto> {
	constructor(
		private readonly db: PrismaService,
		private readonly pdfService: PdfService,
	) {}

	async getReport(
		query: PurchaseReportQueryDto,
		user: TokenPayload,
		res: Response,
	) {
		const { fromDate, toDate } = this.getRange(query);

		const purchases = await this.db.purchase.findMany({
			where: {
				date: { gte: fromDate, lte: toDate },
			},
			include: {
				provider: true,
				stock: true,
			},
			orderBy: {
				date: 'desc',
			},
		});

		if (purchases.length === 0) {
			throw new NotFoundException(
				'No se encontraron compras en el rango seleccionado',
			);
		}

		const totalCompras = purchases.length;
		const sumaCostos = purchases.reduce((acc, p) => acc + Number(p.total), 0);
		const sumaIva = purchases.reduce((acc, p) => acc + Number(p.ivaTotal), 0);

		const comprasPorProveedor = purchases.reduce(
			(acc, p) => {
				const key = p.provider.businessName || 'Sin proveedor';
				acc[key] = (acc[key] || 0) + Number(p.total);
				return acc;
			},
			{} as Record<string, number>,
		);
		const comprasPorDeposito = purchases.reduce(
			(acc, p) => {
				const key = p.stock.name || 'Sin depósito';
				acc[key] = (acc[key] || 0) + Number(p.total);
				return acc;
			},
			{} as Record<string, number>,
		);
		const proveedores = Object.keys(comprasPorProveedor).sort();
		const depositos = Object.keys(comprasPorDeposito).sort();
		const coloresProveedores = ColorUtils.getManyRanHexColor(
			proveedores.length,
		);
		const coloresDepositos = ColorUtils.getManyRanHexColor(depositos.length);

		const topProduct = await this.db.$queryRaw<
			{ name: string; totalQuantity: number }[]
		>(Prisma.sql`
	SELECT 
		p."name", 
		SUM(pd."quantity") AS "totalQuantity"
	FROM "PurchaseDetail" pd
	JOIN "Product" p ON p.id = pd."productId"
	JOIN "Purchase" pu ON pu.id = pd."purchaseId"
	WHERE pu."date" BETWEEN ${fromDate} AND ${toDate}
	GROUP BY p."name"
	ORDER BY "totalQuantity" DESC
	LIMIT 1
`);

		const purchasesByTags = await this.db.$queryRaw<
			{ tag: string; total: number }[]
		>(Prisma.sql`
  SELECT 
    t."name" AS tag,
    SUM(pd."partialAmount")::numeric AS total
  FROM "PurchaseDetail" pd
  JOIN "Product" p ON p.id = pd."productId"
  JOIN "ProductTag" pt ON pt."productId" = p.id
  JOIN "Tag" t ON t.id = pt."tagId"
  JOIN "Purchase" pu ON pu.id = pd."purchaseId"
  WHERE pu."date" BETWEEN ${fromDate} AND ${toDate}
  GROUP BY t."name"
  ORDER BY total DESC
`);

		const tags = purchasesByTags.map((t) => t.tag);
		const coloresTags = ColorUtils.getManyRanHexColor(tags.length);

		const totalTagsAmount = purchasesByTags.reduce(
			(acc, tagData) => acc + Number(tagData.total),
			0,
		);

		const umbralPorcentaje = 5;
		let otrosTotal = 0;

		const tagsWithColors = purchasesByTags
			.map((tagData, i) => {
				const value = Number(tagData.total);
				const percentage = (value / totalTagsAmount) * 100;

				if (percentage < umbralPorcentaje) {
					otrosTotal += value;
					return null;
				}

				return {
					label: tagData.tag,
					value,
					color: coloresTags[i],
				};
			})
			.filter((item): item is Exclude<typeof item, null> => item !== null);

		// Agregar "Otros" si corresponde
		if (otrosTotal > 0) {
			tagsWithColors.push({
				label: 'Otros',
				value: otrosTotal,
				color: '#CCCCCC',
			});
		}

		const charts: ReportChartConfig[] = [
			{
				title: ' ¿Dónde invertiste más? - Distribución por depósitos',
				type: 'pie',
				components: depositos.map((label, i) => ({
					label,
					value: comprasPorDeposito[label],
					color: coloresDepositos[i],
				})),
			},
			{
				title: ' ¿Qué comprás según etiquetas? - Top etiquetas por monto',
				type: 'pie',
				components: tagsWithColors,
			},
			{
				type: 'pie',
				title: '',
				components: [],
			},
			{
				title: 'Tus mejores aliados: Proveedores que más te vendieron',
				type: 'pie',
				components: proveedores.map((label, i) => ({
					label,
					value: comprasPorProveedor[label],
					color: coloresProveedores[i],
				})),
			},
		];

		const summaryItems: SummaryItem[] = [
			{
				key: 'Rango de fechas',
				value: `${toDateFormat(query.from)} a ${toDateFormat(query.to)}`,
			},
			{
				key: 'Total de compras',
				value: Number(totalCompras).toLocaleString(),
			},
			{
				key: 'Suma total de costos',
				value: Number(sumaCostos).toLocaleString(),
			},
			{
				key: 'Suma total de IVA',
				value: Number(sumaIva).toLocaleString(),
			},
			{
				key: 'Producto más comprado',
				value: `${topProduct[0].name} (${topProduct[0].totalQuantity} unidades)`,
			},
		];

		const rows = purchases.map((p) => ({
			values: [
				toDateFormat(p.date),
				p.provider.businessName,
				p.stock.name,
				Number(p.total).toLocaleString(),
				Number(p.ivaTotal).toLocaleString(),
			],
		}));

		return this.pdfService.generateCompactTablePDF(
			{
				title: 'Reporte de Compras',
				madeBy: `${user.fullName} con RUC: ${user.ruc}`,
				summary: summaryItems,
				charts,
				subtitle: 'Tu inversión en productos',
				rowConfig: {
					parentRowSpacing: 10,
					alwaysShowHeader: false,
					header: ['Fecha', 'Proveedor', 'Depósito', 'Total (Gs)', 'IVA (Gs)'],
					widths: [15, 20, 20, 20, 10],
					data: rows,
				},
			},
			res,
		);
	}

	private getRange(query: PurchaseReportQueryDto) {
		return {
			fromDate: new Date(query.from),
			toDate: new Date(query.to),
		};
	}
}
