import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { UserController } from '@/user/user.controller';
import { UserService } from '@/user/user.service';
import { UserDto } from '@/user/dto/user.dto';
import { userMock, paginatedResultMock, expUser } from '@test-lib/mock/user';
import { RolesGuard } from '@/lib/guard/role.guard';
import { AutoPassGuardMock, expCommonPagMock } from '@test-lib/mock/commons';

const userService = {
	update: jest.fn().mockImplementation((id, body) => ({
		...userMock,
		...body,
	})),
	remove: jest.fn().mockResolvedValue({ id: 1, deletedAt: new Date() }),
	create: jest.fn().mockResolvedValue(userMock),
	findAll: jest.fn().mockImplementation(({ page: currentPage, size }) => ({
		...paginatedResultMock,
		currentPage,
		size,
	})),
	findOne: jest.fn().mockResolvedValue(userMock),
};

describe('UserController (e2e)', () => {
	let app: INestApplication;
	const setupApp = async () => {
		const moduleRef = await Test.createTestingModule({
			controllers: [UserController],
			providers: [{ provide: UserService, useValue: userService }],
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
		expect(response.body).toMatchObject<UserDto>(expectedBody);
	};

	it('/GET user [error in query parse]', async () => {
		const url = '/user?page=-1';
		await request(app.getHttpServer()).get(url).expect(400);
	});

	it('/GET user', async () => {
		const url = '/user?page=1&size=20&from=2025-01-12T00:00:00.000Z';
		const response = await request(app.getHttpServer()).get(url).expect(200);

		expect(userService.findAll).toHaveBeenCalledWith({
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

	it('/POST user', async () => {
		const body = {
			fullName: 'testuser',
			email: 'test@example.com',
			password: 'securepassword123',
		};
		const url = '/user';
		const response = await request(app.getHttpServer())
			.post(url)
			.send(body)
			.expect(201);

		expect(response.body).toEqual(
			expect.objectContaining({
				...expUser,
				fullName: body.fullName,
				email: body.email,
				createdAt: expect.any(String),
				updatedAt: expect.any(String),
			}),
		);
	});

	it('/POST user [validation error]', async () => {
		const invalidBody = {
			username: 'testuser',
			email: 'invalid-email',
			password: '123',
		};
		const url = '/user';
		await request(app.getHttpServer()).post(url).send(invalidBody).expect(400);
	});

	it('/GET user/:id', async () => {
		const url = '/user/1';
		const response = await request(app.getHttpServer()).get(url).expect(200);

		expect(userService.findOne).toHaveBeenCalledWith(1);
		assertResponse(response, {
			...expUser,
			createdAt: expect.any(String),
			updatedAt: expect.any(String),
		});
	});

	it('/DELETE user/:id', async () => {
		const url = '/user/1';
		await request(app.getHttpServer()).delete(url).expect(200);
		expect(userService.remove).toHaveBeenCalledWith(1);
	});

	it('/PATCH user/:id', async () => {
		const url = '/user/1';
		const body = { username: 'updateduser' };
		const response = await request(app.getHttpServer())
			.patch(url)
			.send(body)
			.expect(200);

		expect(userService.update).toHaveBeenCalledWith(1, body);
		assertResponse(response, {
			id: 1,
			username: 'updateduser',
		});
	});
});
