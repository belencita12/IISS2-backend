import { Test } from '@nestjs/testing';
import { PrismaService } from '@/prisma.service';
import { RoleService } from '@/features/role/role.service';
import {
	paginateMock,
	pagRolesResultMock,
	roleListMock,
	roleMock,
	queryMock,
	expRole,
} from '@test-lib/mock/role';

describe('RoleService', () => {
	let roleService: RoleService;

	const prismaServiceMock = {
		paginate: jest.fn().mockResolvedValue(paginateMock),
		getPagOutput: jest.fn().mockResolvedValue(pagRolesResultMock),
		getBaseWhere: jest.fn().mockResolvedValue({ baseWhere: {} }),
		role: {
			count: jest.fn().mockResolvedValue(2),
			findMany: jest.fn().mockResolvedValue(roleListMock),
			findUnique: jest.fn().mockResolvedValue(roleMock),
			update: jest.fn().mockImplementation(({ where: { id }, data }) => {
				if (data.deletedAt) return { ...roleMock, deletedAt: new Date() };
				return {
					...roleMock,
					id,
					name: data.name,
				};
			}),
			create: jest.fn().mockResolvedValue({ ...roleMock, name: 'USER' }),
		},
	};

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			providers: [
				RoleService,
				{ provide: PrismaService, useValue: prismaServiceMock },
			],
		}).compile();

		roleService = moduleRef.get(RoleService);
	});

	describe('findAll', () => {
		it('should return a paginated list of roles', async () => {
			expect(
				await roleService.findAll({
					page: queryMock.page,
					includeDeleted: false,
				}),
			).toEqual(pagRolesResultMock);
		});
	});

	describe('findOne', () => {
		it('should return a role by id = 1', async () => {
			expect(await roleService.findOne(1)).toEqual({ ...expRole, id: 1 });
		});
	});

	describe('create', () => {
		it('should create a role with the name USER', async () => {
			expect(await roleService.create({ name: 'USER' })).toEqual({
				...expRole,
				name: 'USER',
			});
		});
	});

	describe('update', () => {
		it('should update a role with the name USER', async () => {
			expect(await roleService.update(1, { name: 'USER' })).toEqual({
				...expRole,
				name: 'USER',
				id: 1,
			});
		});
	});

	describe('remove', () => {
		it('should remove a role with the id 1', async () => {
			expect(await roleService.remove(1)).toEqual({
				...expRole,
				deletedAt: expect.any(Date),
				id: 1,
			});
		});
	});
});
