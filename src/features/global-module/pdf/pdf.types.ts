import { ChartComponent, SupportedCharts } from '../chart/chart.types';

export type ReportRow = {
	values: string[];
	details?: ReportRowConfig;
};
export type SummaryItem = {
	key: string;
	value: string;
	desc?: string;
};

export interface ReportChartConfig {
	title: string;
	type: SupportedCharts;
	components: ChartComponent[];
}

export interface ReportPdfConfig {
	title: string;
	madeBy?: string;
	rowConfig: ReportRowConfig;
	summary?: SummaryItem[];
	charts?: ReportChartConfig[];
	subtitle?: string;
}

export interface ReportRowConfig {
	alwaysShowHeader?: boolean;
	header: string[];
	widths: number[];
	data: {
		values: string[];
		details?: ReportRowConfig;
	}[];
	parentRowSpacing?: number;
}

export type DrawTextProps = {
	doc: PDFKit.PDFDocument;
	text: string;
	x?: number;
	y?: number;
	width?: number;
	height?: number;
	options?: {
		font?: string;
		fontSize?: number;
		color?: string;
		italic?: boolean;
		bold?: boolean;
	};
};
