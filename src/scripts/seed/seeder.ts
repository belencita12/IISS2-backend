import { PrismaClient } from '@prisma/client';
import {
	seedEmployees,
	seedPets,
	seedProducts,
	seedRaces,
	seedRoles,
	seedSpecies,
	seedStock,
	seedClients,
	seedVaccineManufacturers,
	seedVaccineRegistries,
	seedVaccines,
	seedWorkPositions,
	seedProviders,
	seedStampe,
	seedTags,
	seedPaymentMethods,
} from './data';

export const seeder = async () => {
	const TIME_OUT_TX = 2 * 60 * 1000;
	const prisma = new PrismaClient();

	await prisma.$transaction(
		async (tx) => {
			await seedTags(tx);
			console.log('Tags were seeded successfully\n');

			await seedRoles(tx);
			console.log('Roles were seeded successfully\n');

			await seedClients(tx);
			console.log('Clients were seeded successfully\n');

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

			await seedProviders(tx);
			console.log('Providers were seeded successgully\n');

			await seedProducts(tx);
			console.log('Products were seeded successfully\n');

			await seedVaccineManufacturers(tx);
			console.log('Vaccine Manufacturers were seeded successfully\n');

			await seedVaccines(tx);
			console.log('Vaccines were seeded successfully\n');

			await seedVaccineRegistries(tx);
			console.log('Vaccine Registries were seeded successfully\n');

			await seedPaymentMethods(tx);
			console.log('Payment Methods were seeded successfully\n');

			await seedStock(tx);
			console.log('Stock were seeded successfully\n');

			await seedStampe(tx);
			console.log('Stampeds were seeded successfully\n');
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
