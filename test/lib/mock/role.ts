export const expRole = {
	id: expect.any(Number),
	name: expect.any(String),
	createdAt: expect.any(Date),
	updatedAt: expect.any(Date),
	deletedAt: null,
};

export const roleMock = {
	id: 1,
	name: 'ADMIN',
	createdAt: new Date(),
	updatedAt: new Date(),
	deletedAt: null,
};

export const roleListMock = [roleMock, { ...roleMock, id: 2, name: 'USER' }];

export const queryMock = {
	page: 1,
};

export const paginatedResultMock = {
	data: roleListMock,
	total: 2,
	size: 10,
	prev: false,
	next: false,
	currentPage: 1,
	totalPages: 1,
};

export const expPagMock = {
	data: expect.any(Array),
	currentPage: expect.any(Number),
	size: expect.any(Number),
	totalPages: expect.any(Number),
	total: expect.any(Number),
	next: expect.any(Boolean),
	prev: expect.any(Boolean),
};

export const paginateMock = {
	skip: 0,
	take: 10,
	orderBy: { createdAt: 'desc' },
};
