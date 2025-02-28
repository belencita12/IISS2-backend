import { Prisma } from '@prisma/client';
import { hash } from '../../lib/utils/encrypt';

const SEED_USERS: Prisma.UserCreateArgs[] = [
	{
		data: {
			fullName: 'Juan Gimenez',
			username: 'admin@abc123',
			email: 'admin@gmail.com',
			password: 'admin123',
			roles: {
				connectOrCreate: {
					where: { name: 'ADMIN' },
					create: { name: 'ADMIN' },
				},
			},
		},
	},
	{
		data: {
			fullName: 'Arturo Gonzalez',
			username: 'user@abc123',
			email: 'user@gmail.com',
			password: 'user1234',
			roles: {
				connectOrCreate: {
					where: { name: 'USER' },
					create: { name: 'USER' },
				},
			},
		},
	},
];

export const getSeedUsers = async () => {
	for (const user of SEED_USERS) {
		user.data.password = await hash(user.data.password);
	}
	return SEED_USERS;
};

export const SEED_ROLES: Prisma.RoleCreateManyArgs = {
	data: [
		{
			name: 'ADMIN',
		},
		{
			name: 'USER',
		},
	],
};
