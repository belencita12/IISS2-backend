import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '@/auth/auth.controller';
import { AuthService } from '@/auth/auth.service';
import { UserService } from '@/user/user.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { INestApplication } from '@nestjs/common';
import { EnvService } from '@/env/env.service';
import {
	authServiceMock,
	userServiceMock,
	envServiceMock,
	signInBodyMock,
	signUpBodyMock,
	signInResMock,
} from '@test-lib/mock/auth';
import { expUser } from '@test-lib/mock/user';

let authToken: string = '';
const tokenPayload = {
	id: 1,
	username: 'testuser',
	email: signInBodyMock.email,
};

describe('AuthController (e2e)', () => {
	let app: INestApplication;
	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [
				JwtModule.register({
					global: true,
					secret: 'test-secret',
					signOptions: { expiresIn: '1h' },
				}),
			],
			controllers: [AuthController],
			providers: [
				{ provide: AuthService, useValue: authServiceMock },
				{ provide: UserService, useValue: userServiceMock },
				{ provide: EnvService, useValue: envServiceMock },
			],
		}).compile();
		app = moduleFixture.createNestApplication();
		await app.init();

		const jwtService = moduleFixture.get<JwtService>(JwtService);
		authToken = jwtService.sign(tokenPayload, { secret: 'test-secret' });
	});
	afterAll(async () => await app.close());

	it('/POST signup', async () => {
		const url = '/auth/signup';
		await request(app.getHttpServer())
			.post(url)
			.send(signUpBodyMock)
			.expect(201);
		expect(authServiceMock.signUp).toHaveBeenCalledWith(signUpBodyMock);
	});

	it('/POST signin', async () => {
		const url = '/auth/signin';
		const response = await request(app.getHttpServer())
			.post(url)
			.send(signInBodyMock)
			.expect(201);
		expect(authServiceMock.signIn).toHaveBeenCalledWith(signInBodyMock);
		expect(response.body).toMatchObject(signInResMock);
	});

	it('/GET me', async () => {
		const url = '/auth/me';
		const bearer = `Bearer ${authToken}`;
		const response = await request(app.getHttpServer())
			.get(url)
			.set('Authorization', bearer)
			.expect(200);

		expect(authServiceMock.me).toHaveBeenCalledWith({
			...tokenPayload,
			iat: expect.any(Number),
			exp: expect.any(Number),
		});

		expect(userServiceMock.findOne).toHaveBeenCalledWith(1);

		console.log(response.body);

		expect(response.body).toEqual({
			...expUser,
			password: expect.any(String),
			createdAt: expect.any(String),
			updatedAt: expect.any(String),
		});
	});

	it('/GET me [invalid token]', async () => {
		const url = '/auth/me';
		const bearer = `Bearer INVALID_TOKEN`;
		await request(app.getHttpServer())
			.get(url)
			.set('Authorization', bearer)
			.expect(401);
	});
});
