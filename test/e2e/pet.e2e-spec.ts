import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import {
	INestApplication,
	NotFoundException,
	ValidationPipe,
} from '@nestjs/common';
import { PetService } from '@/features/pet/pet.service';
import { PetController } from '@/features/pet/pet.controller';
import { CreatePetDto } from '@/features/pet/dto/create-pet.dto';
import { PetDto } from '@/features/pet/dto/pet.dto';
import { UpdatePetDto } from '@/features/pet/dto/update-pet.dto';
import {
	pagPetMock,
	petDtoMock,
	petMock,
	expPetDtoMock,
} from '@test-lib/mock/pet';
import { AuthGuard } from '@/features/auth/guard/auth.guard';
import { AutoPassGuardMock, expCommonPagMock } from '@test-lib/mock/commons';

const petService = {
	findAll: jest.fn().mockImplementation(({ page: currentPage, size }) => {
		return {
			...pagPetMock,
			currentPage,
			size,
		};
	}),
	findOne: jest.fn().mockImplementation((id: number) => {
		if (id === 1) return petDtoMock;
		else throw new NotFoundException(`Mascota con id ${id} no encontrada`);
	}),
	create: jest.fn().mockImplementation((createPetDto: CreatePetDto): PetDto => {
		return { ...petDtoMock, ...createPetDto };
	}),
	update: jest.fn().mockImplementation((id: number, dto: UpdatePetDto) => {
		if (id === 1) return { ...petDtoMock, ...dto };
		else throw new NotFoundException(`Mascota con id ${id} no encontrada`);
	}),
	remove: jest.fn().mockImplementation((id: number) => {
		if (id === 1) return { ...petDtoMock, deletedAt: new Date() };
		else throw new NotFoundException(`Mascota con id ${id} no encontrada`);
	}),
};

describe('PetController (e2e)', () => {
	let app: INestApplication;
	const setupApp = async () => {
		const moduleRef = await Test.createTestingModule({
			controllers: [PetController],
			providers: [{ provide: PetService, useValue: petService }],
		})
			.overrideGuard(AuthGuard)
			.useValue(AutoPassGuardMock)
			.compile();
		app = moduleRef.createNestApplication();
		app.useGlobalPipes(new ValidationPipe({ transform: true }));
		await app.init();
	};

	beforeAll(setupApp);
	afterAll(async () => await app.close());

	describe('GET /pet', () => {
		it('Debería retornar error 400 al usar speciesId=abc en query', async () => {
			const size = 10;
			const page = 1;
			const speciesId = 'abc';
			const url = `/pet?page=${page}&size=${size}&speciesId=${speciesId}`;
			const result = await request(app.getHttpServer()).get(url);
			expect(result.body.statusCode).toBe(400);
		});

		it('Debería retornar todas las mascotas utilizando page=1 y size=20 del query', async () => {
			const size = 20;
			const page = 1;
			const url = `/pet?page=${page}&size=${size}`;
			const response = await request(app.getHttpServer()).get(url).expect(200);
			expect(response.body).toMatchObject({
				...expCommonPagMock,
				currentPage: page,
				size,
			});
			expect(petService.findAll).toHaveBeenCalledWith({
				page,
				size,
				includeDeleted: false,
			});
		});
	});

	describe('GET /pet:id', () => {
		it('Debería retornar error 400 si el valor pasado como id no es un number', async () => {
			const url = '/pet/abc';
			await request(app.getHttpServer()).get(url).expect(400);
		});

		it('Debería retornar error 404 si el id es de una mascota inexistente', async () => {
			const url = `/pet/${petMock.id + 1}`;
			await request(app.getHttpServer()).get(url).expect(404);
		});

		it('Debería retornar la mascota con el id pasado como parametro', async () => {
			const url = `/pet/${petMock.id}`;
			const response = await request(app.getHttpServer()).get(url).expect(200);
			expect(response.body).toEqual({
				...expPetDtoMock,
				id: 1,
			});
		});
	});

	describe('POST /pet', () => {
		it('Debería retornar el pet con los datos del dto pasado', async () => {
			const url = '/pet';
			const { id, ...body } = petMock;
			const response = await request(app.getHttpServer())
				.post(url)
				.send(body)
				.expect(201);
			expect(response.body).toEqual({
				...expPetDtoMock,
				...body,
				dateOfBirth: expect.any(String),
				id,
			});
		});

		it('Debería retornar un 400 al intentar usar el valor "trescientos" en dateOfBirth', async () => {
			const url = '/pet';
			const body = { ...petMock, dateOfBirth: 'trescientos' };
			await request(app.getHttpServer()).post(url).send(body).expect(400);
		});
	});

	describe('PUT /pet:id', () => {
		it('Debería retornar el pet con los datos del dto pasado', async () => {
			const url = `/pet/${petMock.id}`;
			const { id, ...body } = petMock;
			const response = await request(app.getHttpServer())
				.patch(url)
				.send(body)
				.expect(200);
			expect(response.body).toEqual({
				...expPetDtoMock,
				...body,
				dateOfBirth: expect.any(String),
				id,
			});
		});

		it('Debería retornar un 400 al intentar usar el valor 123 en name', async () => {
			const url = `/pet/${petMock.id}`;
			const body = { ...petMock, name: 123 };
			await request(app.getHttpServer()).patch(url).send(body).expect(400);
		});
	});

	describe('DELETE /pet:id', () => {
		it('Debería retornar el pet eliminado con los datos del dto pasado y con deletedAt con un date-string', async () => {
			const url = `/pet/${petMock.id}`;
			const response = await request(app.getHttpServer())
				.delete(url)
				.expect(200);
			expect(response.body).toEqual({
				...expPetDtoMock,
				dateOfBirth: expect.any(String),
				deletedAt: expect.any(String),
				id: 1,
			});
		});
	});
});
