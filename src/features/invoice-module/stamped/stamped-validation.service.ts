import { getToday, normalizeDate } from '@lib/utils/date';

export class StampedValidationService {
	static isValidDateRange(
		from: string,
		to: string,
		date: Date | string = getToday(),
	): boolean {
		const today = typeof date === 'string' ? date : normalizeDate(date);
		return today < from && today < to;
	}

	static isFromBeforeTo(from: string, to: string): boolean {
		return from < to;
	}

	static isNumRangeValid(from: number, to: number): boolean {
		return from < to;
	}
}
