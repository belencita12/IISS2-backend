export const expCommonPagMock = {
	data: expect.any(Array),
	currentPage: expect.any(Number),
	size: expect.any(Number),
	totalPages: expect.any(Number),
	total: expect.any(Number),
	next: expect.any(Boolean),
	prev: expect.any(Boolean),
};

export const genPagMock = <T>(
	data: T[] = [],
	currentPage = 1,
	size = 10,
	total = 100,
) => {
	const totalPages = Math.ceil(total / size);
	return {
		data: data,
		currentPage,
		size,
		totalPages,
		total,
		next: currentPage < totalPages,
		prev: currentPage > 1,
	};
};

export const AutoPassGuardMock = {
	canActivate: jest.fn().mockResolvedValue(true),
};
