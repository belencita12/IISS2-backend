export const petMock = {
	id: 1,
	name: 'Bruce',
	speciesId: 1,
	raceId: 1,
	weight: 12,
	sex: 'Macho',
	profileImg: 'https://image.url/profile.jpg',
	dateOfBirth: new Date(),
	vaccinationBookletId: 1,
};

export const petDtoMock = {
	...petMock,
	createdAt: new Date(),
	updatedAt: new Date(),
	deletedAt: null,
};

export const expPetMock = {
	id: expect.any(Number),
	name: expect.any(String),
	speciesId: expect.any(Number),
	raceId: expect.any(Number),
	weight: expect.any(Number),
	sex: expect.any(String),
	profileImg: expect.any(String),
	dateOfBirth: expect.any(Date),
	vaccinationBookletId: expect.any(Number),
};

export const expPetDtoMock = {
	...expPetMock,
	dateOfBirth: expect.any(String),
	createdAt: expect.any(String),
	updatedAt: expect.any(String),
	deletedAt: null,
};

export const expPagPetMock = {
	data: expect.any(Array),
	currentPage: expect.any(Number),
	size: expect.any(Number),
	totalPages: expect.any(Number),
	total: expect.any(Number),
	next: expect.any(Boolean),
	prev: expect.any(Boolean),
};

export const pagPetMock = {
	data: [petDtoMock],
	currentPage: 1,
	size: 1,
	totalPages: 1,
	total: 1,
	next: false,
	prev: false,
};
