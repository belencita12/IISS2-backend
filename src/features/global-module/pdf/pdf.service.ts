import * as PDFDocument from 'pdfkit';
import { Response } from 'express';
import { Injectable } from '@nestjs/common';
import { PdfStylesUtils } from './pdf-styles-utils';
import {
	ReportChartConfig,
	ReportPdfConfig,
	ReportRowConfig,
	SummaryItem,
} from './pdf.types';
import { getToday, toDateFormat } from '@lib/utils/date';
import { ChartService } from '../chart/chart.service';
import { InvoiceData } from '@lib/types/invoice-pdf';

@Injectable()
export class PdfService {
	private readonly rowHeight = 12;
	private readonly indentSize = 20;
	private readonly margin = 48;
	private readonly topHeight = 64;

	constructor(private readonly chartService: ChartService) {}

	meses = [
		'enero',
		'febrero',
		'marzo',
		'abril',
		'mayo',
		'junio',
		'julio',
		'agosto',
		'septiembre',
		'octubre',
		'noviembre',
		'diciembre',
	];
	generateFormattedInvoicePDF = (invoice: InvoiceData, res: Response) => {
		const doc = new PDFDocument({ margin: 20, size: 'A4' });

		res.setHeader('Content-Type', 'application/pdf');
		res.setHeader(
			'Content-Disposition',
			`attachment; filename="invoice_${invoice.invoiceNumber}.pdf"`,
		);

		doc.pipe(res);

		const fecha = `${invoice.issueDate.getDate()} de ${this.meses[invoice.issueDate.getMonth()]} de ${invoice.issueDate.getFullYear()}`;
		doc
			.fontSize(12)
			.text('NICOPETS - Clinica Veterinaria', 30, 30, { align: 'left' })
			.fontSize(9)
			.text('Dirección: Calle Ficticia N° 123 - Ciudad Mascota', 30, 45)
			.text('Teléfono: (0981) 123-456 / Email: contacto@nicopet.com', 30, 57)
			.text('Timbrado: 98589132 - Vigencia: 01/01/2025 al 31/12/2025', 30, 69)
			.fontSize(11)
			.text(
				`Factura ${invoice.type === 'CASH' ? 'Contado' : 'Crédito'}`,
				450,
				30,
			)
			.text(`N°: ${invoice.invoiceNumber}`, 450, 45);

		doc
			.moveDown()
			.rect(20, 90, 570, 50)
			.stroke()
			.fontSize(9)
			.text(`Razón Social: ${invoice.client.fullName}`, 30, 100)
			.text(`Dirección: ${invoice.client.address}`, 30, 115)
			.text(`Fecha: ${fecha}`, 450, 100)
			.text(`RUC/CI: ${invoice.client.ruc}`, 450, 115);

		let currentY = 150;
		doc
			.rect(20, currentY, 570, 20)
			.stroke()
			.fontSize(9)
			.text('Código', 30, currentY + 5)
			.text('Descripción', 130, currentY + 5)
			.text('Precio Vta.', 320, currentY + 5)
			.text('Cant.', 420, currentY + 5)
			.text('Subtotal', 500, currentY + 5);

		currentY += 20;
		invoice.products.forEach((product) => {
			doc
				.rect(20, currentY, 570, 20)
				.stroke()
				.fontSize(9)
				.text(product.code, 30, currentY + 5)
				.text(product.name, 130, currentY + 5)
				.text(product.unitCost.toLocaleString('de-DE'), 320, currentY + 5)
				.text(product.quantity.toString(), 420, currentY + 5)
				.text(product.subtotal.toLocaleString('de-DE'), 500, currentY + 5);
			currentY += 20;
		});

		currentY += 10;
		doc
			.fontSize(10)
			.text(
				`Total IVA: ${invoice.totalIVA.toLocaleString('de-DE')}`,
				450,
				currentY,
			)
			.text(
				`Total a Pagar: ${invoice.totalToPay.toLocaleString('de-DE')}`,
				450,
				currentY + 12,
			)
			.font('Helvetica');
		doc.end();
	};

	generateCompactTablePDF(reportConfig: ReportPdfConfig, response: Response) {
		const { title, rowConfig, madeBy, summary, charts } = reportConfig;
		const mainHeader = rowConfig.header;
		const doc = new PDFDocument({
			margin: this.margin,
			size: 'A4',
		});
		response.setHeader('Content-Type', 'application/pdf');
		response.setHeader(
			'Content-Disposition',
			`attachment; filename="${Date.now()}.pdf`,
		);
		doc.pipe(response);
		let currentY = this.renderTitle(doc, title, madeBy);
		if (summary && summary.length > 0) {
			currentY = this.renderSummary(doc, summary, currentY);
		}
		if (charts && charts.length > 0) {
			currentY = this.renderChartsAsColumns(doc, charts, currentY);
		}
		this.renderTableRecursive(
			doc,
			rowConfig,
			0,
			currentY,
			mainHeader,
			rowConfig.alwaysShowHeader,
		);
		doc.end();
	}

	private renderChartsAsColumns(
		doc: PDFKit.PDFDocument,
		charts: ReportChartConfig[],
		startY: number,
	): number {
		const imageSize = 70;
		const paddingX = 32;
		const chartsPerRow = 3;

		let y = startY;
		let x = this.margin;
		let column = 0;
		const rowHeight = imageSize + 36;

		charts.forEach((chart) => {
			if (column === chartsPerRow) {
				column = 0;
				x = this.margin;
				y += rowHeight;
				if (PdfStylesUtils.isPageOverflow(doc, y + rowHeight)) {
					doc.addPage();
					y = this.topHeight;
				}
			}

			const isntPie = chart.type !== 'pie';
			const chartBuffer = this.chartService.generateChartBuffer({
				components: chart.components,
				type: chart.type,
			});

			doc.font('Helvetica-Bold').fontSize(7).text(chart.title, x, y, {
				width: 0,
				align: 'center',
			});

			const imageY = y + 12;
			doc.image(chartBuffer, x, imageY, {
				width: imageSize,
				height: imageSize,
			});

			let legendY = imageY;
			const legendX = x + imageSize + 8;

			if (!isntPie) {
				chart.components.forEach((component) => {
					doc.rect(legendX, legendY, 8, 8).fill(component.color).stroke();
					doc
						.font('Helvetica')
						.fontSize(6)
						.fillColor('black')
						.text(
							`${component.label} (${Number(component.value).toLocaleString()})`,
							legendX + 10,
							legendY + 2,
						);
					legendY += 10;
				});
			}

			x += 156 + paddingX;
			column++;
		});

		return y + rowHeight;
	}

	private renderTableRecursive(
		doc: PDFKit.PDFDocument,
		rowConfig: ReportRowConfig,
		depth: number = 0,
		startY?: number,
		mainHeader?: string[],
		allwaysShowHeader: boolean = false,
	): number {
		let y = startY ?? doc.y;
		const { header, data, widths, parentRowSpacing = 0 } = rowConfig;
		const rowHeight = this.rowHeight;

		const startX = this.getXOffset();
		let colWidths = widths.map((perc) =>
			PdfStylesUtils.getWidth(doc, this.margin, perc),
		);
		colWidths = [
			PdfStylesUtils.getMaxWidth(doc, this.margin) * 0.05,
			...colWidths,
		];
		const augmentedHeader = ['#', ...header];

		if (!allwaysShowHeader) {
			this.renderTableHeader(
				doc,
				startX,
				y,
				colWidths,
				augmentedHeader,
				depth === 0,
			);
			y += rowHeight;
		}

		data.forEach((row, rowIndex) => {
			if (PdfStylesUtils.isPageOverflow(doc, y + rowHeight)) {
				doc.addPage();
				y = this.topHeight;
			}

			if (allwaysShowHeader && mainHeader) {
				this.renderTableHeader(
					doc,
					startX,
					y,
					colWidths,
					augmentedHeader,
					depth === 0,
				);
				y += rowHeight;
			}

			y = this.renderRowValue(row.values, doc, startX, y, colWidths, rowIndex);

			if (row.details && row.details.data.length > 0) {
				y = this.renderTableRecursive(doc, row.details, depth + 1, y);
			}

			if (depth === 0) y += parentRowSpacing;
		});

		return y;
	}

	private renderRowValue(
		values: string[],
		doc: PDFKit.PDFDocument,
		startX: number,
		y: number,
		colWidths: number[],
		index: number,
	) {
		const bgColor = index % 2 === 0 ? '#fff' : '#ddd';
		doc
			.fillColor('black')
			.fillOpacity(1)
			.rect(
				startX,
				y,
				colWidths.reduce((a, b) => a + b, 0),
				this.rowHeight,
			)
			.fillAndStroke(bgColor, bgColor);
		const allValues = [(index + 1).toString(), ...values];
		allValues.forEach((val, i) => {
			doc
				.fillColor('black')
				.font('Helvetica')
				.fontSize(5)
				.text(
					val,
					startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0) + 3,
					y + 3,
					{
						width: colWidths[i],
						height: this.rowHeight,
						ellipsis: true,
						lineBreak: false,
					},
				);
		});

		return (y += this.rowHeight);
	}

	private renderSummary(
		doc: PDFKit.PDFDocument,
		summary: SummaryItem[],
		startY: number,
	): number {
		let y = startY;
		doc.font('Helvetica-Bold', 8).text('Resumen', this.getXOffset(), y);
		y += this.rowHeight;

		summary.forEach((item) => {
			if (PdfStylesUtils.isPageOverflow(doc, y)) {
				doc.addPage();
				y = this.topHeight;
			}

			doc
				.font('Helvetica-Bold', 6)
				.text(item.key + ':', this.getXOffset(), y, { continued: true })
				.font('Helvetica')
				.text(' ' + item.value);

			if (item.desc) {
				y += this.rowHeight;
				doc
					.font('Helvetica-Oblique')
					.fontSize(5)
					.text(item.desc, this.getXOffset(1), y);
			}

			y += this.rowHeight;
		});

		y += this.rowHeight;
		return y;
	}

	private renderTableHeader(
		doc: PDFKit.PDFDocument,
		x: number,
		y: number,
		colWidths: number[],
		header: string[],
		isMain: boolean,
	) {
		doc
			.fillColor(isMain ? 'white' : 'black')
			.font('Helvetica-Bold')
			.fontSize(5)
			.fillOpacity(1)
			.rect(
				x,
				y,
				colWidths.reduce((a, b) => a + b, 0),
				this.rowHeight,
			)
			.fillAndStroke(isMain ? '#000' : '#bbb', isMain ? '#000' : '#bbb');

		header.forEach((col, i) => {
			doc
				.fillColor(isMain ? 'white' : 'black')
				.text(
					col,
					x + colWidths.slice(0, i).reduce((a, b) => a + b, 0) + 3,
					y + 3,
					{
						width: colWidths[i],
						height: this.rowHeight,
					},
				);
		});
	}

	private renderTitle(doc: PDFKit.PDFDocument, title: string, madeBy?: string) {
		const today = getToday();
		doc
			.font('Helvetica-Bold', 10)
			.text(
				`${title} ${madeBy ? `generado por ${madeBy}` : ''} el día ${toDateFormat(today)}`,
			);
		doc.moveDown();
		return doc.y;
	}

	private getXOffset(space: number = 0): number {
		return this.margin + this.indentSize * space;
	}
}
