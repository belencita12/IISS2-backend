import { SignInDto } from '@/auth/dto/sign-in.dto';
import { SignUpDto } from '@/auth/dto/sign-up.dto';
import * as bcrypt from 'bcrypt';
import { userMock } from './user';
import { UserDto } from '@/user/dto/user.dto';
import { TokenPayload } from '@/auth/types/auth.types';

export const signInBodyMock: SignInDto = {
	email: 'test@example.com',
	password: 'securepassword123',
};

export const tokenPayloadMock = {
	id: 1,
	username: 'testuser',
	email: 'test@example.com',
};

export const getUserHashed = async () => {
	const hash = await bcrypt.hash(signInBodyMock.password, 10);
	return {
		id: 1,
		username: 'testuser',
		email: 'test@example.com',
		roles: [{ name: 'ADMIN' }],
		deletedAt: null,
		password: hash,
	};
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
	me: jest
		.fn()
		.mockImplementation(async (data: TokenPayload): Promise<UserDto> => {
			const user = await getUserHashed();
			return {
				...user,
				username: data.username,
				roles: user.roles.map((r) => r.name),
				deletedAt: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			};
		}),
};

export const userServiceMock = {
	create: jest.fn().mockResolvedValue({ id: 1, ...signUpBodyMock }),
	findOne: jest.fn().mockResolvedValue({ ...userMock, id: 1 }),
	findByEmail: jest.fn().mockImplementation(async () => {
		const user = await getUserHashed();
		return user;
	}),
};

export const envServiceMock = {
	get: jest.fn((key: string) => {
		if (key === 'JWT_SECRET') return 'test-secret';
		if (key === 'JWT_EXP') return '1h';
		return null;
	}),
};
