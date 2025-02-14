export type PagOutputParams<T> = {
	size?: number;
	page: number;
	data: T[];
	total: number;
};
