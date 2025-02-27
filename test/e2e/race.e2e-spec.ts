import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { RaceController } from '@/race/race.controller';
import { RaceService } from '@/race/race.service';
import { RaceDto } from '@/race/dto/race.dto';
import {
	raceMock,
	paginatedRaceMock,
	expRace,
	expPagRaceMock,
} from '@test-lib/mock/race';

const raceService = {
	update: jest.fn().mockImplementation((id, body) => ({
		...raceMock,
		...body,
	})),
	remove: jest.fn().mockResolvedValue({ id: 1, deletedAt: new Date() }),
	create: jest.fn().mockResolvedValue(raceMock),
	findAll: jest.fn().mockImplementation(({ page: currentPage, size }) => ({
		...paginatedRaceMock,
		currentPage,
		size,
	})),
	findOne: jest.fn().mockResolvedValue(raceMock),
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

	const assertResponse = (response, expectedBody) => {
		expect(response.body).toMatchObject<RaceDto>(expectedBody);
	};

	it('/GET race [error in query parse]', async () => {
		const url = '/race?page=-1';
		await request(app.getHttpServer()).get(url).expect(400);
	});

	it('/GET race', async () => {
		const url = '/race?page=1&size=20';
		const response = await request(app.getHttpServer()).get(url).expect(200);

		expect(raceService.findAll).toHaveBeenCalledWith({
			page: 1,
			size: 20,
			includeDeleted: false,
		});

		assertResponse(response, {
			...expPagRaceMock,
			currentPage: 1,
			size: 20,
		});
	});

	it('/POST race', async () => {
		const body = {
			name: 'Labrador',
			speciesId: 1,
		};
		const url = '/race';
		const response = await request(app.getHttpServer())
			.post(url)
			.send(body)
			.expect(201);

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

	it('/POST race [validation error]', async () => {
		const invalidBody = {
			name: 123,
			speciesId: 'invalid',
		};
		const url = '/race';
		await request(app.getHttpServer()).post(url).send(invalidBody).expect(400);
	});

	it('/GET race/:id', async () => {
		const url = '/race/1';
		const response = await request(app.getHttpServer()).get(url).expect(200);

		expect(raceService.findOne).toHaveBeenCalledWith(1);
		assertResponse(response, {
			...expRace,
			createdAt: expect.any(String),
			updatedAt: expect.any(String),
		});
	});

	it('/DELETE race/:id', async () => {
		const url = '/race/1';
		await request(app.getHttpServer()).delete(url).expect(200);
		expect(raceService.remove).toHaveBeenCalledWith(1);
	});

	it('/PATCH race/:id', async () => {
		const url = '/race/1';
		const body = { name: 'Golden Retriever' };
		const response = await request(app.getHttpServer())
			.patch(url)
			.send(body)
			.expect(200);

		expect(raceService.update).toHaveBeenCalledWith(1, body);
		assertResponse(response, {
			id: 1,
			name: 'Golden Retriever',
		});
	});

	//Para verificar si se piden muchas razas o una página muy alta, no falle.
	it('/GET race [pagination edge cases]', async () => {
		await request(app.getHttpServer())
			.get('/race?page=1&size=1000')
			.expect(200);

		await request(app.getHttpServer())
			.get('/race?page=99999&size=10')
			.expect(200);
	});
});
