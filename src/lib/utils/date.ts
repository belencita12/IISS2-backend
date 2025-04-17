export const toDate = (date: Date) => date.toISOString().split('T')[0];

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
