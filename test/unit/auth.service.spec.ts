import { AuthService } from '@/auth/auth.service';
import { EnvService } from '@/env/env.service';
import { UserService } from '@/user/user.service';
import { JwtModule } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import {
	envServiceMock,
	signInBodyMock,
	signUpBodyMock,
	userServiceMock,
} from '@test-lib/mock/auth';
import { expUser } from '@test-lib/mock/user';

describe('AuthService', () => {
	let authService: AuthService;

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			providers: [
				AuthService,
				{ provide: UserService, useValue: userServiceMock },
				{ provide: EnvService, useValue: envServiceMock },
			],
			imports: [
				JwtModule.register({
					global: true,
					secret: 'test-secret',
					signOptions: { expiresIn: '1h' },
				}),
			],
		}).compile();

		authService = moduleRef.get(AuthService);
	});

	describe('signin', () => {
		it('Should return the credentials and the token', async () => {
			const res = await authService.signIn(signInBodyMock);
			expect(res).toEqual({
				token: expect.any(String),
				username: 'testuser',
				roles: ['ADMIN'],
			});
		});
	});

	describe('signup', () => {
		it('Should create the new user', async () => {
			await authService.signUp(signUpBodyMock);
			expect(userServiceMock.create).toHaveBeenCalledWith(signUpBodyMock);
		});
	});

	describe('me', () => {
		it('Should return the user with their credentials from the payload token', async () => {
			const tokenPayloadMock = {
				id: 1,
				username: 'testuser',
				email: 'test@example.com',
			};

			//
			const res = await authService.me(tokenPayloadMock);

			// Verify if the fn return the user
			expect(res).toEqual(expUser);

			// Verify if the fn use the same id of the payload
			expect(userServiceMock.findOne).toHaveBeenCalledWith(1);
		});
	});
});
