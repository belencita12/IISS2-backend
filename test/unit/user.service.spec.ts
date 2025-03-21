//unit/user.service.spec.ts
import { Test } from '@nestjs/testing';
import { PrismaService } from '@/prisma.service';
import { UserService } from '@/features/user/user.service';
import { hash } from '@/lib/utils/encrypt'; // Función para encriptar contraseñas
import {
	paginateMock,
	paginatedResultMock,
	userListMock,
	userMock,
	queryMock,
	expUser,
} from '@test-lib/mock/user';

jest.mock('@/lib/utils/encrypt', () => ({
	hash: jest.fn().mockResolvedValue('hashedPassword'),
}));

describe('UserService', () => {
	let userService: UserService;

	const prismaServiceMock = {
		paginate: jest.fn().mockResolvedValue(paginateMock),
		getPagOutput: jest.fn().mockResolvedValue(paginatedResultMock),
		getBaseWhere: jest.fn().mockResolvedValue({ baseWhere: {} }),
		user: {
			count: jest.fn().mockResolvedValue(2),
			findMany: jest.fn().mockResolvedValue(userListMock),
			findUnique: jest.fn().mockResolvedValue(userMock),
			update: jest.fn().mockImplementation(({ where: { id }, data }) => {
				if (data.deletedAt) return { ...userMock, deletedAt: new Date() };
				return {
					...userMock,
					id,
					...data,
					roles: [{ name: 'USER' }],
				};
			}),
			create: jest.fn().mockResolvedValue(userMock),
		},
	};

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			providers: [
				UserService,
				{ provide: PrismaService, useValue: prismaServiceMock },
			],
		}).compile();

		userService = moduleRef.get(UserService);
	});

	describe('findAll', () => {
		it('should return a paginated list of users', async () => {
			expect(
				await userService.findAll({
					page: queryMock.page,
					includeDeleted: false,
				}),
			).toEqual(paginatedResultMock);
		});
	});

	describe('findOne', () => {
		it('should return a user by id = 1', async () => {
			expect(await userService.findOne(1)).toEqual({ ...expUser, id: 1 });
		});
	});

	describe('create', () => {
		it('should create a user with given data', async () => {
			const createData = {
				username: 'testuser',
				email: 'test@example.com',
				password: 'password123',
				roles: ['USER'],
			};

			expect(await userService.create(createData)).toEqual({
				...expUser,
				username: createData.username,
				email: createData.email,
			});

			expect(hash).toHaveBeenCalledWith(createData.password);
		});
	});

	describe('update', () => {
		it('should update a user with given data', async () => {
			expect(await userService.update(1, { fullName: 'updateduser' })).toEqual({
				...expUser,
				username: 'updateduser',
				id: 1,
			});
		});
	});

	describe('remove', () => {
		it('should remove a user with the id 1', async () => {
			expect(await userService.remove(1)).toEqual({
				...expUser,
				deletedAt: expect.any(Date),
				id: 1,
			});
		});
	});

	describe('findByEmail', () => {
		it('should find a user by email', async () => {
			const email = 'test@example.com';

			expect(await userService.findByEmail(email)).toEqual({
				...expUser,
				email,
			});

			expect(prismaServiceMock.user.findUnique).toHaveBeenCalledWith({
				where: { email },
				include: { roles: true },
			});
		});
	});
});
