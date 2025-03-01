import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import {
	INestApplication,
	NotFoundException,
	ValidationPipe,
} from '@nestjs/common';
import { RaceService } from '@/race/race.service';
import { RaceController } from '@/race/race.controller';
import { CreateRaceDto } from '@/race/dto/create-race.dto';
import { RaceDto } from '@/race/dto/race.dto';
import { UpdateRaceDto } from '@/race/dto/update-race.dto';
import { paginatedRaceMock, raceMock, expRace } from '@test-lib/mock/race';
import { RolesGuard } from '@/lib/guard/role.guard';
import { AutoPassGuardMock, expCommonPagMock } from '@test-lib/mock/commons';

const raceService = {
	findAll: jest.fn().mockImplementation(({ page: currentPage, size }) => {
		return {
			...paginatedRaceMock,
			currentPage,
			size,
		};
	}),
	findOne: jest.fn().mockImplementation((id: number) => {
		if (id === 1) return raceMock;
		else throw new NotFoundException(`Raza con id ${id} no encontrada`);
	}),
	create: jest
		.fn()
		.mockImplementation((createRaceDto: CreateRaceDto): RaceDto => {
			return { ...raceMock, ...createRaceDto };
		}),
	update: jest.fn().mockImplementation((id: number, dto: UpdateRaceDto) => {
		if (id === 1) return { ...raceMock, ...dto };
		else throw new NotFoundException(`Raza con id ${id} no encontrada`);
	}),
	remove: jest.fn().mockImplementation((id: number) => {
		if (id === 1) return { ...raceMock, deletedAt: new Date() };
		else throw new NotFoundException(`Raza con id ${id} no encontrada`);
	}),
};

describe('RaceController (e2e)', () => {
	let app: INestApplication;
	const setupApp = async () => {
		const moduleRef = await Test.createTestingModule({
			controllers: [RaceController],
			providers: [{ provide: RaceService, useValue: raceService }],
		})
			.overrideGuard(RolesGuard)
			.useValue(AutoPassGuardMock)
			.compile();
		app = moduleRef.createNestApplication();
		app.useGlobalPipes(new ValidationPipe({ transform: true }));
		await app.init();
	};

	beforeAll(setupApp);
	afterAll(async () => await app.close());

	describe('GET /race', () => {
		it('Error 400 cuando el parámetro speciesId no es válido', async () => {
			const size = 10;
			const page = 1;
			const speciesId = 'abc';
			const url = `/race?page=${page}&size=${size}&speciesId=${speciesId}`;
			const result = await request(app.getHttpServer()).get(url);
			expect(result.body.statusCode).toBe(400);
		});

		it('Lista de razas con los parámetros de query page=1 y size=20', async () => {
			const size = 20;
			const page = 1;
			const url = `/race?page=${page}&size=${size}`;
			const response = await request(app.getHttpServer()).get(url).expect(200);
			expect(response.body).toMatchObject({
				...expCommonPagMock,
				currentPage: page,
				size,
			});
			expect(raceService.findAll).toHaveBeenCalledWith({
				page,
				size,
				includeDeleted: false,
			});
		});
	});

	describe('GET /race/:id', () => {
		it('Error 400 cuando el parámetro id no es un número válido', async () => {
			const url = '/race/abc';
			await request(app.getHttpServer()).get(url).expect(400);
		});

		it('Error 404 si el id de la raza no existe', async () => {
			const url = `/race/${raceMock.id + 1}`;
			await request(app.getHttpServer()).get(url).expect(404);
		});

		it('Retorna la raza correspondiente cuando el id es válido', async () => {
			const url = `/race/${raceMock.id}`;
			const response = await request(app.getHttpServer()).get(url).expect(200);
			expect(response.body).toEqual({
				...expRace,
				id: 1,
				createdAt: expect.any(String),
				updatedAt: expect.any(String),
			});
		});
	});

	describe('POST /race', () => {
		it('Retorna la raza con los datos del dto cuando se crea correctamente', async () => {
			const url = '/race';
			const { id, ...body } = raceMock;
			const response = await request(app.getHttpServer())
				.post(url)
				.send(body)
				.expect(201);
			expect(response.body).toEqual({
				...expRace,
				...body,
				id,
				createdAt: expect.any(String),
				updatedAt: expect.any(String),
			});
		});

		it('Error 400 cuando se intenta usar un valor incorrecto en name', async () => {
			const url = '/race';
			const body = { ...raceMock, name: 123 };
			await request(app.getHttpServer()).post(url).send(body).expect(400);
		});
	});

	describe('PATCH /race/:id', () => {
		it('Retorna la raza con los datos del dto cuando se actualiza correctamente', async () => {
			const url = `/race/${raceMock.id}`;
			const { id, ...body } = raceMock;
			const response = await request(app.getHttpServer())
				.patch(url)
				.send(body)
				.expect(200);
			expect(response.body).toEqual({
				...expRace,
				...body,
				id,
				createdAt: expect.any(String),
				updatedAt: expect.any(String),
			});
		});

		it('Retorna error 400 cuando se intenta usar un valor incorrecto en name', async () => {
			const url = `/race/${raceMock.id}`;
			const body = { ...raceMock, name: 123 };
			await request(app.getHttpServer()).patch(url).send(body).expect(400);
		});
	});

	describe('DELETE /race/:id', () => {
		it('Retorna la raza eliminada con los datos del dto y con deletedAt como un string de fecha', async () => {
			const url = `/race/${raceMock.id}`;
			const response = await request(app.getHttpServer())
				.delete(url)
				.expect(200);
			expect(response.body).toEqual({
				...expRace,
				deletedAt: expect.any(String),
				id: 1,
			});
		});
	});
});
