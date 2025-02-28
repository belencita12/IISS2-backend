import { genPagMock } from './commons';

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

export const pagRolesResultMock = genPagMock(roleListMock);

export const paginateMock = {
	skip: 0,
	take: 10,
	orderBy: { createdAt: 'desc' },
};
