import { PrismaClient } from '@prisma/client';
import { SEED_ROLES, getSeedUsers } from './data';

export const seeder = async () => {
	const prisma = new PrismaClient();

	const SEED_USERS = await getSeedUsers();

	await prisma.$transaction(async (tx) => {
		await tx.role.createMany(SEED_ROLES);
		await Promise.all(SEED_USERS.map((user) => tx.user.create(user)));
	});

	await prisma.$disconnect();
};

seeder()
	.then(() => {
		console.log('Seed executed successfully');
	})
	.catch((err) => {
		console.error("Seed can't be executed", err);
	});
