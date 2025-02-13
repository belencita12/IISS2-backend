import { PrismaClient } from '@prisma/client';

export const seeder = async () => {
	const prisma = new PrismaClient();
	await prisma.$transaction([
		prisma.role.deleteMany(),
		prisma.user.deleteMany(),
	]);
	await prisma.$disconnect();
};

seeder()
	.then(() => {
		console.log('The DB was cleared successfully');
	})
	.catch((err) => {
		console.error("The DB can't be cleared", err);
	});
