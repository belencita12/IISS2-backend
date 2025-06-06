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

	getRangeFromTodayTo(days: number): { gte?: string; lte?: string } {
		const today = DateTime.now().setZone(this.timeZone).startOf('day');
		const day = today.plus({ days });
		const start = day.startOf('day').toUTC().toISO();
		const end = day.endOf('day').toUTC().toISO();
		if (!start || !end) throw new Error('Invalid date range');
		return { gte: start, lte: end };
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
