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

@Injectable()
export class PdfService {
	private readonly rowHeight = 12;
	private readonly indentSize = 20;
	private readonly margin = 48;
	private readonly topHeight = 64;

	constructor(private readonly chartService: ChartService) {}

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
			`attachment; filename="${Date.now()}.pdf"`,
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
		const imageSize = 72;
		const paddingX = 20;
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
							`${component.label} (${component.value})`,
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
