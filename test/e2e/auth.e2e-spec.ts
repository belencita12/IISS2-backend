import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AuthController } from '@/auth/auth.controller';
import { AuthService } from '@/auth/auth.service';
import { SignUpDto } from '@/auth/dto/sign-up.dto';

const authServiceMock = {
	signUp: jest.fn(),
};

const signUpBodyMock: SignUpDto = {
	username: 'testuser',
	email: 'test@example.com',
	password: 'securepassword123',
};

describe('AuthController (e2e)', () => {
	let app: INestApplication;
	const setupApp = async () => {
		const moduleRef = await Test.createTestingModule({
			controllers: [AuthController],
			providers: [{ provide: AuthService, useValue: authServiceMock }],
		}).compile();
		app = moduleRef.createNestApplication();
		app.useGlobalPipes(new ValidationPipe({ transform: true }));
		await app.init();
	};

	beforeAll(setupApp);
	afterAll(async () => await app.close());

	it('/POST signup', async () => {
		const url = '/signup';
		await request(app.getHttpServer())
			.post(url)
			.send(signUpBodyMock)
			.expect(201);

		expect(authServiceMock.signUp).toHaveBeenCalledWith(signUpBodyMock);
	});
});
