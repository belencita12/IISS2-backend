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

		const charts: ReportChartConfig[] = [
			{
				title: 'Distribución de compras por proveedor',
				type: 'pie',
				components: proveedores.map((label, i) => ({
					label,
					value: comprasPorProveedor[label],
					color: coloresProveedores[i],
				})),
			},
			{
				title: 'Distribución de compras por depósito',
				type: 'pie',
				components: depositos.map((label, i) => ({
					label,
					value: comprasPorDeposito[label],
					color: coloresDepositos[i],
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
				rowConfig: {
					parentRowSpacing: 10,
					alwaysShowHeader: false,
					header: ['Fecha', 'Proveedor', 'Depósito', 'Total (Gs)', 'IVA (Gs)'],
					widths: [25, 25, 10, 10, 10, 10],
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
