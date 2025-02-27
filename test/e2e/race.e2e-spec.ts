import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import {
	INestApplication,
	ValidationPipe,
	NotFoundException,
	BadRequestException,
} from '@nestjs/common';
import { RaceController } from '@/race/race.controller';
import { RaceService } from '@/race/race.service';
import {
	raceMock,
	paginatedRaceMock,
	expRace,
	expPagRaceMock,
} from '@test-lib/mock/race';

const raceService = {
	findAll: jest.fn().mockImplementation(({ page: currentPage, size }) => ({
		...paginatedRaceMock,
		currentPage,
		size,
	})),
	findOne: jest.fn().mockImplementation((id) => {
		if (isNaN(id)) throw new BadRequestException('Id must be a number');
		if (id === 1) return { ...raceMock };
		throw new NotFoundException(`Raza con id ${id} no encontrada`);
	}),
	create: jest.fn().mockImplementation((dto) => ({ ...raceMock, ...dto })),
	update: jest.fn().mockImplementation((id, dto) => {
		if (id === 1) return { ...raceMock, ...dto };
		throw new NotFoundException(`Raza con id ${id} no encontrada`);
	}),
	remove: jest.fn().mockImplementation((id) => {
		if (id === 1) return { ...raceMock, deletedAt: new Date() };
		throw new NotFoundException(`Raza con id ${id} no encontrada`);
	}),
};

describe('RaceController (e2e)', () => {
	let app: INestApplication;

	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({
			controllers: [RaceController],
			providers: [{ provide: RaceService, useValue: raceService }],
		}).compile();

		app = moduleRef.createNestApplication();
		app.useGlobalPipes(new ValidationPipe({ transform: true }));
		await app.init();
	});

	afterAll(async () => await app.close());

	describe('GET /race', () => {
		it('Retorna error 400 si page es negativo', async () => {
			await request(app.getHttpServer()).get('/race?page=-1').expect(400);
		});

		it('Retorna todas las razas con paginación', async () => {
			const page = 1,
				size = 20;
			const response = await request(app.getHttpServer())
				.get(`/race?page=${page}&size=${size}`)
				.expect(200);

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
	});

	describe('GET /race/:id', () => {
		it('Retorna error 400 si el id no es un número', async () => {
			await request(app.getHttpServer()).get('/race/abc').expect(400);
		});

		it('Retorna error 404 si la raza no existe', async () => {
			await request(app.getHttpServer()).get('/race/99').expect(404);
		});

		it('Retorna la raza con el id dado', async () => {
			const response = await request(app.getHttpServer())
				.get('/race/1')
				.expect(200);
			expect(response.body).toMatchObject({ ...expRace, id: 1 });
		});
	});
});
