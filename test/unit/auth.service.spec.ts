import { AuthService } from '@/features/auth/auth.service';
import { EnvService } from '@/env/env.service';
import { UserService } from '@/features/user/user.service';
import { JwtModule } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import {
	envServiceMock,
	signInBodyMock,
	signUpBodyMock,
	tokenPayloadMock,
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
		it('The userService.create should be called with the same params as the authService', async () => {
			await authService.signUp(signUpBodyMock);
			expect(userServiceMock.create).toHaveBeenCalledWith(signUpBodyMock);
		});
	});

	describe('me', () => {
		it('Should return the user with their credentials from the payload token', async () => {
			const res = await authService.me(tokenPayloadMock);
			expect(res).toEqual(expUser);
			expect(userServiceMock.findOne).toHaveBeenCalledWith(1);
		});
	});
});
