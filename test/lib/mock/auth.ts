import { SignInDto } from '@/auth/dto/sign-in.dto';
import { SignUpDto } from '@/auth/dto/sign-up.dto';

export const signInBodyMock: SignInDto = {
	email: 'test@example.com',
	password: 'securepassword123',
};

export const signInResMock = {
	token: 'testtoken',
	username: 'testuser',
	roles: ['ADMIN'],
};

export const signUpBodyMock: SignUpDto = {
	username: 'testuser',
	email: 'test@example.com',
	password: 'securepassword123',
};

export const authServiceMock = {
	signUp: jest.fn(),
	signIn: jest.fn().mockResolvedValue(signInResMock),
	me: jest.fn().mockResolvedValue(signInResMock),
};

export const userServiceMock = {
	create: jest.fn().mockResolvedValue({ id: 1, ...signUpBodyMock }),
	findOne: jest.fn().mockResolvedValue({ id: 1, ...signUpBodyMock }),
	findByEmail: jest.fn().mockResolvedValue({ id: 1, ...signUpBodyMock }),
};

export const envServiceMock = {
	get: jest.fn((key: string) => {
		if (key === 'JWT_SECRET') return 'test-secret';
		if (key === 'JWT_EXP') return '1h';
		return null;
	}),
};
