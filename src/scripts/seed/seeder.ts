import { PrismaClient } from '@prisma/client';
import {
	seedEmployees,
	seedPets,
	seedProducts,
	seedRaces,
	seedRoles,
	seedSpecies,
	seedUsers,
	seedVaccineManufacturers,
	seedVaccineRegistries,
	seedVaccines,
	seedWorkPositions,
} from './data';

export const seeder = async () => {
	const TIME_OUT_TX = 2 * 60 * 1000;
	const prisma = new PrismaClient();

	await prisma.$transaction(
		async (tx) => {
			await seedRoles(tx);
			console.log('Roles were seeded successfully\n');

			await seedUsers(tx);
			console.log('Users were seeded successfully\n');

			await seedSpecies(tx);
			console.log('Species were seeded successfully\n');

			await seedRaces(tx);
			console.log('Races were seeded successfully\n');

			await seedPets(tx);
			console.log('Pets were seeded successfully\n');

			await seedWorkPositions(tx);
			console.log('Work positions were seeded successfully\n');

			await seedEmployees(tx);
			console.log('Employees were seeded successfully\n');

			await seedProducts(tx);
			console.log('Products were seeded successfully\n');

			await seedVaccineManufacturers(tx);
			console.log('Vaccine Manufacturers were seeded successfully\n');

			await seedVaccines(tx);
			console.log('Vaccines were seeded successfully\n');

			await seedVaccineRegistries(tx);
			console.log('Vaccine Registries were seeded successfully\n');
		},
		{ timeout: TIME_OUT_TX, maxWait: TIME_OUT_TX },
	);

	await prisma.$disconnect();
};

seeder()
	.then(() => {
		console.log('Seed executed successfully');
	})
	.catch((err) => {
		console.error("Seed couldn't be executed correctly", err);
	});
