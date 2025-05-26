import { EnvService } from '../env/env.service';
import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';

@Injectable()
export class DateService {
	private readonly timeZone: string;

	constructor(private readonly env: EnvService) {
		this.timeZone = this.env.get('SYS_TIME_ZONE');
	}

	getToday(toISO = false): Date | string {
		const builder = DateTime.now().setZone(this.timeZone);
		return toISO ? builder.toISO()! : builder.toJSDate();
	}

	getDate(value: string | Date): string {
		const date = typeof value === 'string' ? new Date(value) : value;
		const builder = DateTime.fromJSDate(date).setZone(this.timeZone);
		return builder.toISO()!;
	}

	getRangePlusDays(daysAhead: number): { gte: string; lte: string } {
		const date = DateTime.now()
			.setZone(this.timeZone)
			.plus({ days: daysAhead });

		const start = date.startOf('day');
		const end = date.endOf('day');

		if (!start.isValid || !end.isValid) {
			throw new Error('Invalid calculated date');
		}

		return {
			gte: start.toISO(),
			lte: end.toISO(),
		};
	}

	getRangeForPrisma(
		from?: string,
		to?: string,
	): { gte?: string; lte?: string } {
		const range: { gte?: string; lte?: string } = {};
		if (from) {
			const fromDate = DateTime.fromISO(from, { zone: this.timeZone }).startOf(
				'day',
			);
			if (!fromDate.isValid) throw new Error('Invalid from date');
			range.gte = fromDate.toISO()!;
		}
		if (to) {
			const toDate = DateTime.fromISO(to, { zone: this.timeZone }).endOf('day');
			if (!toDate.isValid) throw new Error('Invalid to date');
			range.lte = toDate.toISO()!;
		}
		return range;
	}
}
