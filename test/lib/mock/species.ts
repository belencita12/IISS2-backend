import { SpeciesDto } from '@/species/dto/species.dto';

export const speciesMock: SpeciesDto = {
	id: 1,
	name: 'Canino',
};

export const speciesListMock = [
	speciesMock,
	{ ...speciesMock, id: 2, name: 'Felino' },
];

export const querySpeciesMock = {
	page: 1,
};

export const paginatedSpeciesMock = {
	data: speciesListMock,
	total: 2,
	size: 10,
	prev: false,
	next: false,
	currentPage: 1,
	totalPages: 1,
};

export const expSpeciesMock = {
	id: expect.any(Number),
	name: expect.any(String),
};

export const expPagSpeciesMock = {
	data: expect.any(Array),
	currentPage: expect.any(Number),
	size: expect.any(Number),
	totalPages: expect.any(Number),
	total: expect.any(Number),
	next: expect.any(Boolean),
	prev: expect.any(Boolean),
};

export const paginateSpeciesMock = {
	skip: 0,
	take: 10,
	orderBy: { id: 'desc' },
};
