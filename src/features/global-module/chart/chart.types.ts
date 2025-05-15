export type ChartComponent = {
	value: number;
	label: string;
	color: string;
};

export type GenerateChartConfig = {
	components: ChartComponent[];
	type: SupportedCharts;
};

export type SupportedCharts = 'pie' | 'line' | 'bar';
