import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { RoleService } from '@/features/role/role.service';
import { RoleController } from '@/features/role/role.controller';
import { RoleDto } from '@/features/role/dto/role.dto';
import { roleMock, pagRolesResultMock, expRole } from '@test-lib/mock/role';
import { AutoPassGuardMock, expCommonPagMock } from '@test-lib/mock/commons';
import { RolesGuard } from '@/lib/guard/role.guard';

const roleService = {
	update: jest.fn().mockResolvedValue(roleMock),
	remove: jest.fn().mockResolvedValue({ id: 1, deletedAt: new Date() }),
	create: jest.fn().mockResolvedValue(roleMock),
	findAll: jest.fn().mockImplementation(({ page: currentPage, size }) => ({
		...pagRolesResultMock,
		currentPage,
		size,
	})),
};

describe('RoleController (e2e)', () => {
	let app: INestApplication;
	const setupApp = async () => {
		const moduleRef = await Test.createTestingModule({
			controllers: [RoleController],
			providers: [{ provide: RoleService, useValue: roleService }],
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

	const assertResponse = (response, expectedBody) => {
		expect(response.body).toMatchObject<RoleDto>(expectedBody);
	};

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
			...expCommonPagMock,
			currentPage: 1,
			size: 20,
		});
	});

	it('/POST role', async () => {
		const body = { name: 'ADMIN' };
		const url = '/role';
		const response = await request(app.getHttpServer())
			.post(url)
			.send(body)
			.expect(201);

		expect(response.body).toEqual(
			expect.objectContaining({
				...expRole,
				name: 'ADMIN',
				createdAt: expect.any(String),
				updatedAt: expect.any(String),
			}),
		);
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
