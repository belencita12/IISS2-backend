export const expRace = {
	id: expect.any(Number),
	name: expect.any(String),
	speciesId: expect.any(Number),
	createdAt: expect.any(Date),
	updatedAt: expect.any(Date),
	deletedAt: null,
};

export const raceMock = {
	id: 1,
	name: 'Labrador',
	speciesId: 1,
	createdAt: new Date(),
	updatedAt: new Date(),
	deletedAt: null,
};

export const raceListMock = [
	raceMock,
	{ ...raceMock, id: 2, name: 'Golden Retriever' },
];

export const queryRaceMock = {
	page: 1,
};

export const paginatedRaceMock = {
	data: raceListMock,
	total: 2,
	size: 10,
	prev: false,
	next: false,
	currentPage: 1,
	totalPages: 1,
};

export const expPagRaceMock = {
	data: expect.any(Array),
	currentPage: expect.any(Number),
	size: expect.any(Number),
	totalPages: expect.any(Number),
	total: expect.any(Number),
	next: expect.any(Boolean),
	prev: expect.any(Boolean),
};

export const paginateRaceMock = {
	skip: 0,
	take: 10,
	orderBy: { createdAt: 'desc' },
};
