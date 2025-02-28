import { PetDto } from '@/pet/dto/pet.dto';
import { genPagMock } from './commons';

export const petMock: PetDto = {
	id: 1,
	name: 'Bruce',
	speciesId: 1,
	raceId: 1,
	userId: 1,
	weight: 12,
	sex: 'M',
	profileImg: 'https://image.url/profile.jpg',
	dateOfBirth: new Date(),
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
	userId: expect.any(Number),
	speciesId: expect.any(Number),
	raceId: expect.any(Number),
	weight: expect.any(Number),
	sex: expect.any(String),
	profileImg: expect.any(String),
	dateOfBirth: expect.any(Date),
};

export const expPetDtoMock = {
	...expPetMock,
	dateOfBirth: expect.any(String),
	createdAt: expect.any(String),
	updatedAt: expect.any(String),
	deletedAt: null,
};

export const pagPetMock = genPagMock([petDtoMock]);
