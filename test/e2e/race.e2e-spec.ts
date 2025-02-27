import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import {
	INestApplication,
	NotFoundException,
	ValidationPipe,
} from '@nestjs/common';
import { RaceController } from '@/race/race.controller';
import { RaceService } from '@/race/race.service';
import { RaceDto } from '@/race/dto/race.dto';
import { CreateRaceDto } from '@/race/dto/create-race.dto';
import { UpdateRaceDto } from '@/race/dto/update-race.dto';
import {
	raceMock,
	paginatedRaceMock,
	expRace,
	expPagRaceMock,
} from '@test-lib/mock/race';

const raceService = {
	update: jest.fn().mockImplementation((id: number, dto: UpdateRaceDto) => {
		if (id === 1) return { ...raceMock, ...dto };
		else throw new NotFoundException(`Raza con id ${id} no encontrada`);
	}),
	remove: jest.fn().mockImplementation((id: number) => {
		if (id === 1) return { ...raceMock, deletedAt: new Date() };
		else throw new NotFoundException(`Raza con id ${id} no encontrada`);
	}),
	create: jest
		.fn()
		.mockImplementation((createRaceDto: CreateRaceDto): RaceDto => {
			return { ...raceMock, ...createRaceDto };
		}),
	findAll: jest.fn().mockImplementation(({ page: currentPage, size }) => ({
		...paginatedRaceMock,
		currentPage,
		size,
	})),
	findOne: jest.fn().mockImplementation((id: number) => {
		if (id === 1) return raceMock;
		else throw new NotFoundException(`Raza con id ${id} no encontrada`);
	}),
};

describe('RaceController (e2e)', () => {
	let app: INestApplication;
	const setupApp = async () => {
		const moduleRef = await Test.createTestingModule({
			controllers: [RaceController],
			providers: [{ provide: RaceService, useValue: raceService }],
		}).compile();
		app = moduleRef.createNestApplication();
		app.useGlobalPipes(new ValidationPipe({ transform: true }));
		await app.init();
	};

	beforeAll(setupApp);
	afterAll(async () => await app.close());

	describe('GET /race', () => {
		it('Retorna error 400 al usar speciesId=abc en query', async () => {
			const size = 10;
			const page = 1;
			const speciesId = 'abc';
			const url = `/race?page=${page}&size=${size}&speciesId=${speciesId}`;
			await request(app.getHttpServer()).get(url).expect(400);
		});

		it('Retorna error 400 si el page es negativo', async () => {
			const url = '/race?page=-1';
			await request(app.getHttpServer()).get(url).expect(400);
		});

		it('Retorna todas las razas utilizando page=1 y size=20 del query', async () => {
			const size = 20;
			const page = 1;
			const url = `/race?page=${page}&size=${size}`;
			const response = await request(app.getHttpServer()).get(url).expect(200);

			expect(raceService.findAll).toHaveBeenCalledWith({
				page,
				size,
				includeDeleted: false,
			});

			expect(response.body).toMatchObject({
				...expPagRaceMock,
				currentPage: page,
				size,
			});
		});

		it('Debería manejar correctamente casos extremos de paginación', async () => {
			await request(app.getHttpServer())
				.get('/race?page=1&size=1000')
				.expect(200);

			await request(app.getHttpServer())
				.get('/race?page=99999&size=10')
				.expect(200);
		});
	});

	describe('GET /race/:id', () => {
		it('Retorna error 400 si el valor pasado como id no es un number', async () => {
			const url = '/race/abc';
			await request(app.getHttpServer()).get(url).expect(400);
		});

		it('Retorna error 404 si el id es de una raza inexistente', async () => {
			const url = `/race/${raceMock.id + 1}`;
			await request(app.getHttpServer()).get(url).expect(404);
		});

		it('Retorna la raza con el id pasado como parámetro', async () => {
			const url = `/race/${raceMock.id}`;
			const response = await request(app.getHttpServer()).get(url).expect(200);
			expect(raceService.findOne).toHaveBeenCalledWith(raceMock.id);

			expect(response.body).toEqual({
				...expRace,
				id: raceMock.id,
				name: raceMock.name,
				speciesId: raceMock.speciesId,
				createdAt: expect.any(String),
				updatedAt: expect.any(String),
				deletedAt: null,
			});
		});
	});

	describe('POST /race', () => {
		it('Retorna la raza con los datos del dto pasado', async () => {
			const url = '/race';
			const body = {
				name: 'Labrador',
				speciesId: 1,
			};
			const response = await request(app.getHttpServer())
				.post(url)
				.send(body)
				.expect(201);

			expect(raceService.create).toHaveBeenCalledWith(body);

			expect(response.body).toEqual(
				expect.objectContaining({
					...expRace,
					name: body.name,
					speciesId: body.speciesId,
					createdAt: expect.any(String),
					updatedAt: expect.any(String),
				}),
			);
		});

		it('Retorna un 400 al intentar usar valores no válidos en name', async () => {
			const url = '/race';
			const invalidBody = { name: 123, speciesId: 1 };
			await request(app.getHttpServer())
				.post(url)
				.send(invalidBody)
				.expect(400);
		});

		it('Retorna un 400 al intentar usar valores no válidos en speciesId', async () => {
			const url = '/race';
			const invalidBody = { name: 'Labrador', speciesId: 'invalid' };
			await request(app.getHttpServer())
				.post(url)
				.send(invalidBody)
				.expect(400);
		});

		it('Retorna un 400 si faltan campos requeridos', async () => {
			const url = '/race';
			const incompleteBody = { name: 'Labrador' };
			await request(app.getHttpServer())
				.post(url)
				.send(incompleteBody)
				.expect(400);
		});
	});

	describe('PATCH /race/:id', () => {
		it('Retorna la raza actualizada con los datos del dto pasado', async () => {
			const url = `/race/${raceMock.id}`;
			const body = { name: 'Golden Retriever' };
			const response = await request(app.getHttpServer())
				.patch(url)
				.send(body)
				.expect(200);

			expect(raceService.update).toHaveBeenCalledWith(raceMock.id, body);

			expect(response.body).toEqual(
				expect.objectContaining({
					id: raceMock.id,
					name: 'Golden Retriever',
					speciesId: raceMock.speciesId,
				}),
			);
		});

		it('Retorna un 400 al intentar actualizar con datos inválidos', async () => {
			const url = `/race/${raceMock.id}`;
			const invalidBody = { name: 123 };
			await request(app.getHttpServer())
				.patch(url)
				.send(invalidBody)
				.expect(400);
		});

		it('Retorna error 404 si se intenta actualizar una raza inexistente', async () => {
			const url = `/race/${raceMock.id + 1}`;
			const body = { name: 'Border Collie' };
			await request(app.getHttpServer()).patch(url).send(body).expect(404);
		});
	});

	describe('DELETE /race/:id', () => {
		it('Retorna la raza eliminada con deletedAt con un date-string', async () => {
			const url = `/race/${raceMock.id}`;
			const response = await request(app.getHttpServer())
				.delete(url)
				.expect(200);

			expect(raceService.remove).toHaveBeenCalledWith(raceMock.id);

			expect(response.body).toEqual(
				expect.objectContaining({
					id: raceMock.id,
					name: raceMock.name,
					speciesId: raceMock.speciesId,
					deletedAt: expect.any(String),
				}),
			);
		});

		it('Retorna error 404 si se intenta eliminar una raza inexistente', async () => {
			const url = `/race/${raceMock.id + 1}`;
			await request(app.getHttpServer()).delete(url).expect(404);
		});
	});
});
