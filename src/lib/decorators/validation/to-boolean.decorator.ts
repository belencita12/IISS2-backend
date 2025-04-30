import { Transform } from 'class-transformer';

export const ToBoolean = () => {
	return Transform(({ value }) => {
		if (typeof value === 'boolean') return value;
		if (typeof value === 'string') {
			return value.toLowerCase() === 'true';
		}
		return Boolean(value);
	});
};
