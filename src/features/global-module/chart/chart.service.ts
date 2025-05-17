import { createCanvas } from 'canvas';
import * as ChartDataLabels from 'chartjs-plugin-datalabels';
import type { Context } from 'chartjs-plugin-datalabels';
import {
	ArcElement,
	BarController,
	BarElement,
	CategoryScale,
	Chart,
	LinearScale,
	LineController,
	LineElement,
	PieController,
	PointElement,
} from 'chart.js';
import { _DeepPartialObject } from 'chart.js/dist/types/utils';
import { Options } from 'chartjs-plugin-datalabels/types/options';
import { GenerateChartConfig, ChartComponent } from './chart.types';
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class ChartService implements OnModuleInit {
	onModuleInit() {
		Chart.register(
			PieController,
			BarController,
			BarElement,
			PointElement,
			LineElement,
			LineController,
			LinearScale,
			CategoryScale,
			ArcElement,
			ChartDataLabels,
		);
	}

	generateChartBuffer({ components, type }: GenerateChartConfig) {
		const isPie = type === 'pie';
		const canvas = createCanvas(216, 216);
		const { backgroundColor, labels, data } =
			this.processChartComponent(components);
		const chart = new Chart(canvas as any, {
			data: { labels, datasets: [{ data, backgroundColor }] },
			options: {
				responsive: false,
				plugins: {
					datalabels: isPie ? this.datalabelConfig() : { display: isPie },
				},
			},
			type: type,
		});
		const pngBuff = canvas.toBuffer('image/png');
		chart.destroy();
		return pngBuff;
	}

	private datalabelConfig(): _DeepPartialObject<Options> {
		return {
			color: '#fff',
			formatter: (value: any, context: Context) => {
				const data = context.chart.data.datasets[0].data as number[];
				const total = data.reduce((a, b) => a + b, 0);
				const percentage = ((value / total) * 100).toFixed(0);
				return `${percentage}%`;
			},
		};
	}

	private processChartComponent(components: ChartComponent[]) {
		const backgroundColor: string[] = [];
		const data: number[] = [];
		const labels: string[] = [];
		components.forEach(({ value, color, label }) => {
			data.push(value);
			backgroundColor.push(color);
			labels.push(label);
		});
		return {
			backgroundColor,
			data,
			labels,
		};
	}
}
