import { Transform } from 'class-transformer';

/**
 * Transforma un string tipo 'YYYY-MM-DD' a Date a las 00:00:00
 */
export function ToStartOfDay() {
	return Transform(({ value }) => {
		if (typeof value === 'string') {
			const date = new Date(value);
			date.setHours(0, 0, 0, 0);
			return date;
		}
		return value;
	});
}

/**
 * Transforma un string tipo 'YYYY-MM-DD' a Date a las 23:59:59.999
 */
export function ToEndOfDay() {
	return Transform(({ value }) => {
		if (typeof value === 'string') {
			const date = new Date(value);
			date.setHours(23, 59, 59, 999);
			return date;
		}
		return value;
	});
}
