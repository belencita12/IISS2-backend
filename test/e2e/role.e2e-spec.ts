import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { RoleService } from '@/role/role.service';
import { RoleController } from '@/role/role.controller';
import { RoleDto } from '@/role/dto/role.dto';

// Datos de mock y respuesta
const roleMock = {
	id: 1,
	name: 'ADMIN',
	createdAt: new Date(),
	updatedAt: new Date(),
	deletedAt: null,
};

const paginatedResultMock = {
	data: [roleMock],
	currentPage: 1,
	size: 10,
	totalPages: 100,
	total: 1000,
	next: false,
	prev: false,
};

// Servicio mockeado
const roleService = {
	update: jest.fn().mockResolvedValue(roleMock),
	remove: jest.fn().mockResolvedValue({ id: 1, deletedAt: new Date() }),
	create: jest.fn().mockResolvedValue(roleMock),
	findAll: jest.fn().mockResolvedValue(paginatedResultMock),
};

describe('RoleController (e2e)', () => {
	let app: INestApplication;

	// Centralizar la configuración del servicio y aplicación
	const setupApp = async () => {
		const moduleRef = await Test.createTestingModule({
			controllers: [RoleController],
			providers: [{ provide: RoleService, useValue: roleService }],
		}).compile();

		app = moduleRef.createNestApplication();
		app.useGlobalPipes(new ValidationPipe({ transform: true }));
		await app.init();
	};

	beforeAll(setupApp);
	afterAll(async () => await app.close());

	// Reducción de código repetido para realizar las verificaciones comunes
	const assertResponse = (response, expectedBody) => {
		expect(response.body).toMatchObject<RoleDto>(expectedBody);
	};

	// Reducción de pruebas repetitivas
	it('/GET role [error in query parse]', async () => {
		const url = '/role?page=-1';
		await request(app.getHttpServer()).get(url).expect(400);
	});

	it(`/GET role`, async () => {
		const url = '/role?page=1&size=20&from=2025-01-12T00:00:00.000Z';
		const response = await request(app.getHttpServer()).get(url).expect(200);

		expect(roleService.findAll).toHaveBeenCalledWith({
			page: 1,
			size: 20,
			from: '2025-01-12T00:00:00.000Z',
			includeDeleted: false,
		});

		assertResponse(response, {
			id: expect.any(Number),
			name: 'ADMIN',
			createdAt: expect.any(String),
			updatedAt: expect.any(String),
			deletedAt: null,
		});
	});

	it('/POST role', async () => {
		const body = { name: 'ADMIN' };
		const url = '/role';
		const response = await request(app.getHttpServer())
			.post(url)
			.send(body)
			.expect(201);

		assertResponse(response, {
			id: expect.any(Number),
			name: 'ADMIN',
			createdAt: expect.any(String),
			updatedAt: expect.any(String),
			deletedAt: null,
		});
	});

	it('/DELETE role/:id', async () => {
		const url = '/role/1';
		await request(app.getHttpServer()).delete(url).expect(200);
		expect(roleService.remove).toHaveBeenCalledWith(1);
	});

	it('/PATCH role/:id', async () => {
		const url = '/role/1';
		const body = { name: 'ADMIN' };
		const response = await request(app.getHttpServer())
			.patch(url)
			.send(body)
			.expect(200);

		expect(roleService.update).toHaveBeenCalledWith(1, body);
		assertResponse(response, { id: 1, name: 'ADMIN' });
	});
});
