export const toDate = (date: Date) => date.toISOString().split('T')[0];

export const toDateFormat = (value: Date | string): string => {
	if (typeof value === 'string') {
		const [year, month, day] = value.split('-');
		return `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;
	}
	const date = new Date(value);
	const [day, month, year] = date.toLocaleDateString('es-PY').split('/');
	return `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;
};

export const isGreaterThan = (date1: string | Date, date2: string | Date) => {
	const firstDate =
		typeof date1 === 'string' ? new Date(date1).getTime() : date1.getTime();
	const secondDate =
		typeof date2 === 'string' ? new Date(date2).getTime() : date2.getTime();

	return firstDate > secondDate;
};

export const isInThisYear = (date: string | Date) => {
	const dateToCompare = typeof date === 'string' ? new Date(date) : date;
	const dateNow = new Date();
	const thisYear = dateNow.getFullYear();
	const thisMonth = dateNow.getMonth();
	return thisYear === dateToCompare.getFullYear() || thisMonth !== 11;
};

export const toUtcDate = (dateStr: string): Date => {
	const [date, time] = dateStr.split('T');
	const [year, month, day] = date.split('-').map(Number);
	const [hour, min] = time.split(':');
	return new Date(Date.UTC(year, month - 1, day, Number(hour), Number(min)));
};

export const getToday = () => {
	const today = new Date();
	return new Date(today.getFullYear(), today.getMonth(), today.getDate());
};

export const normalizeDate = (date: Date) => date.toISOString().split('T')[0];
