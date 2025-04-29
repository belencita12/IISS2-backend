import { Prisma, PrismaClient } from '@prisma/client';
import { hash } from '../../lib/utils/encrypt';
import { DefaultArgs } from '@prisma/client/runtime/library';

type PrismaTransactionClient = Omit<
	PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
	'$on' | '$connect' | '$disconnect' | '$use' | '$transaction' | '$extends'
>;

export const seedEmployees = async (db: PrismaTransactionClient) => {
	const [{ id: veterinarioId }, { id: auxiliarId }, { id: gerenteId }] =
		await db.workPosition.findMany({ select: { id: true } });
	const password = await hash('12345678');

	const employeesData: Prisma.EmployeeCreateInput[] = [
		{
			position: {
				connect: { id: veterinarioId },
			},
			user: {
				create: {
					ruc: '1234567-1',
					username: 'employee_2@example',
					password,
					phoneNumber: '595985764321',
					roles: { connect: [{ name: 'EMPLOYEE' }] },
					fullName: 'Richard Valgaba',
					email: 'employee2@gmail.com',
				},
			},
		},
		{
			position: {
				connect: { id: auxiliarId },
			},
			user: {
				create: {
					ruc: '7654321-2',
					username: 'employee_1@example',
					password,
					phoneNumber: '595985764322',
					roles: { connect: [{ name: 'EMPLOYEE' }] },
					fullName: 'Fernando Valgaba',
					email: 'employee1@gmail.com',
				},
			},
		},
		{
			position: {
				connect: { id: gerenteId },
			},
			user: {
				create: {
					username: 'admin@example',
					password,
					ruc: '7777789-1',
					phoneNumber: '595985764323',
					fullName: 'Florentino Valgaba',
					email: 'admin@gmail.com',
					roles: { connect: [{ name: 'ADMIN' }, { name: 'EMPLOYEE' }] },
				},
			},
		},
	];
	for (const employee of employeesData) {
		await db.employee.create({ data: employee });
	}
};

export const seedClients = async (db: PrismaTransactionClient) => {
	const password = await hash('12345678');
	const clients: Prisma.ClientCreateInput[] = [
		{
			user: {
				create: {
					username: 'richard@example',
					password,
					phoneNumber: '595985764333',
					ruc: '5622567-1',
					adress: 'E/ Posadas y Lomas Valentinas',
					roles: { connect: [{ name: 'USER' }] },
					fullName: 'Richard Valgaba',
					email: 'richard@gmail.com',
				},
			},
		},
		{
			user: {
				create: {
					username: 'adrian@example',
					password,
					phoneNumber: '595985764324',
					ruc: '8373829-1',
					adress: 'Av Irrazabal - Esq. 25 de Mayo',
					roles: { connect: [{ name: 'USER' }] },
					fullName: 'Adrian Valgaba',
					email: 'adrian@gmail.com',
				},
			},
		},
		{
			user: {
				create: {
					username: 'jose@example',
					password,
					phoneNumber: '595922764325',
					ruc: '3748492-1',
					adress: 'Calle Independencia Esq. Villarica',
					roles: { connect: [{ name: 'USER' }] },
					fullName: 'Jose Valgaba',
					email: 'jose@gmail.com',
				},
			},
		},
	];
	for (const c of clients) {
		await db.client.create({ data: c });
	}
};

export const seedRoles = async (db: PrismaTransactionClient) => {
	await db.role.createMany({
		data: [{ name: 'ADMIN' }, { name: 'USER' }, { name: 'EMPLOYEE' }],
		skipDuplicates: true,
	});
};

export const seedSpecies = async (db: PrismaTransactionClient) => {
	await db.species.createMany({
		data: [{ name: 'Perro' }, { name: 'Gato' }],
	});
};

export const seedRaces = async (db: PrismaTransactionClient) => {
	const [{ id: perroId }, { id: gatoId }] = await db.species.findMany({
		select: { id: true },
	});
	await db.race.createMany({
		data: [
			// Perros
			{ name: 'Labrador', speciesId: perroId },
			{ name: 'Golden Retriever', speciesId: perroId },
			{ name: 'Mestizo', speciesId: perroId },

			// Gatos
			{ name: 'Persa', speciesId: gatoId },
			{ name: 'Siames', speciesId: gatoId },
			{ name: 'Mestizo', speciesId: gatoId },
		],
		skipDuplicates: true,
	});
};

export const seedPets = async (db: PrismaTransactionClient) => {
	const dateOfBirth = new Date('2020-05-15T00:00:00.000Z');
	const specie = await db.species.findUnique({ where: { name: 'Perro' } });
	if (!specie) throw new Error('Specie was not created correctly');
	const race = await db.race.findMany({
		where: { speciesId: specie.id },
		orderBy: { name: 'asc' },
	});
	const clients = await db.client.findMany();

	const [client1, client2, client3] = clients;
	const [race1, race2, race3] = race;
	await db.pet.createMany({
		data: [
			{
				name: 'Luna',
				raceId: race1.id,
				clientId: client1.id,
				speciesId: specie.id,
				weight: 5.5,
				sex: 'F',
				dateOfBirth,
			},
			{
				name: 'Max',
				raceId: race2.id,
				clientId: client2.id,
				speciesId: specie.id,
				weight: 4.5,
				sex: 'M',
				dateOfBirth,
			},
			{
				name: 'Felix',
				raceId: race3.id,
				clientId: client2.id,
				speciesId: specie.id,
				weight: 6.5,
				sex: 'M',
				dateOfBirth,
			},
			{
				name: 'Lea',
				raceId: race1.id,
				clientId: client3.id,
				speciesId: specie.id,
				weight: 5.5,
				sex: 'F',
				dateOfBirth,
			},
			{
				name: 'Mike',
				raceId: race1.id,
				clientId: client3.id,
				speciesId: specie.id,
				weight: 5.5,
				sex: 'M',
				dateOfBirth,
			},
			{
				name: 'Chulo',
				raceId: race1.id,
				clientId: client3.id,
				speciesId: specie.id,
				weight: 5.5,
				sex: 'M',
				dateOfBirth,
			},
			{
				name: 'Zoco',
				raceId: race2.id,
				clientId: client3.id,
				speciesId: specie.id,
				weight: 7.5,
				sex: 'M',
				dateOfBirth,
			},
			{
				name: 'Frufru',
				raceId: race3.id,
				clientId: client3.id,
				speciesId: specie.id,
				weight: 3.5,
				sex: 'M',
				dateOfBirth,
			},
		],
	});
};

export const seedWorkPositions = async (db: PrismaTransactionClient) => {
	const shiftsData = [
		{ startTime: '08:00', endTime: '12:00', weekDay: 1 },
		{ startTime: '14:00', endTime: '18:00', weekDay: 1 },
		{ startTime: '08:00', endTime: '12:00', weekDay: 2 },
		{ startTime: '14:00', endTime: '18:00', weekDay: 2 },
		{ startTime: '08:00', endTime: '12:00', weekDay: 3 },
		{ startTime: '14:00', endTime: '18:00', weekDay: 3 },
		{ startTime: '08:00', endTime: '12:00', weekDay: 4 },
		{ startTime: '14:00', endTime: '18:00', weekDay: 4 },
		{ startTime: '08:00', endTime: '12:00', weekDay: 5 },
		{ startTime: '14:00', endTime: '18:00', weekDay: 5 },
	];

	const workPositions: Prisma.WorkPositionCreateInput[] = [
		{
			name: 'Veterinario',
			shifts: { create: shiftsData },
		},
		{ name: 'Auxiliar', shifts: { create: shiftsData } },
		{ name: 'Gerente' },
	];

	for (const workPosition of workPositions) {
		await db.workPosition.create({ data: workPosition });
	}
};

export const seedProviders = async (db: PrismaTransactionClient) => {
	const providersData: Prisma.ProviderCreateInput[] = [
		{
			phoneNumber: '+595985103811',
			businessName: 'Juguetitos Bonitos S.A.',
			ruc: '1236429-1',
		},
		{
			phoneNumber: '+595987103810',
			businessName: 'Comidita Bonita S.A.',
			ruc: '1246428-4',
		},
		{
			phoneNumber: '+595984103719',
			businessName: 'Medicamentos Bonitos S.A.',
			ruc: '1116429-0',
		},
	];
	for (const p of providersData) {
		await db.provider.create({ data: p });
	}
};

export const seedProducts = async (db: PrismaTransactionClient) => {
	const [{ id: prov1Id }, { id: _prov2Id }, { id: prov3Id }] =
		await db.provider.findMany();

	const productsData: Prisma.ProductCreateInput[] = [
		{
			name: 'Desparasitante Perro',
			category: 'PRODUCT',
			provider: { connect: { id: prov3Id } },
			code: `PROD-${genRandomStr()}`,
			prices: { create: { amount: 24000 } },
			costs: { create: { cost: 20000 } },
			iva: 10,
			quantity: 12,
		},
		{
			name: 'Desparasitante Gato',
			category: 'PRODUCT',
			provider: { connect: { id: prov3Id } },
			code: `PROD-${genRandomStr()}`,
			prices: { create: { amount: 28000 } },
			costs: { create: { cost: 2400 } },
			iva: 10,
			quantity: 10,
		},
		{
			name: 'Pelota Juguete Perro',
			category: 'PRODUCT',
			provider: { connect: { id: prov1Id } },
			code: `PROD-${genRandomStr()}`,
			prices: { create: { amount: 20000 } },
			costs: { create: { cost: 18000 } },
			iva: 10,
			quantity: 15,
		},
		{
			name: 'Shampoo Perro 1Lt',
			provider: { connect: { id: prov1Id } },
			category: 'PRODUCT',
			code: `PROD-${genRandomStr()}`,
			costs: { create: { cost: 12000 } },
			prices: { create: { amount: 15000 } },
			iva: 10,
		},
	];
	for (const p of productsData) {
		await db.product.create({ data: p });
	}
};

export const seedVaccineManufacturers = async (db: PrismaTransactionClient) => {
	const vaccinesData: Prisma.VaccineManufacturerCreateManyInput[] = [
		{ name: 'Zoetis' },
		{ name: 'Merial' },
		{ name: 'Boehringer Ingelheim' },
		{ name: 'Novartis' },
		{ name: 'HIPRA' },
	];
	await db.vaccineManufacturer.createMany({ data: vaccinesData });
};

export const seedVaccines = async (db: PrismaTransactionClient) => {
	const [man1, man2, man3] = await db.vaccineManufacturer.findMany();
	const supplier = await db.provider.findUnique({
		where: { ruc: '1116429-0' },
	});
	if (!supplier) throw new Error('Supplier with ruc 1116429-0');
	const [species1, species2] = await db.species.findMany();
	const vaccinesData: Prisma.VaccineCreateInput[] = [
		{
			name: 'Panleucopenia',
			species: { connect: { id: species1.id } },
			manufacturer: { connect: { id: man1.id } },
			batch: {
				create: {
					code: `${genRandomStr()}`,
					manufacturerId: man1.id,
				},
			},
			product: {
				create: {
					name: 'Panleucopenia',
					category: 'VACCINE',
					iva: 0.1,
					providerId: supplier.id,
					code: `PROD-${genRandomStr()}`,
					costs: { create: { cost: 20000 } },
					prices: { create: { amount: 50000 } },
				},
			},
		},
		{
			name: 'Leptospirosis',
			species: { connect: { id: species2.id } },
			manufacturer: { connect: { id: man2.id } },
			batch: {
				create: {
					code: `${genRandomStr()}`,
					manufacturerId: man2.id,
				},
			},
			product: {
				create: {
					name: 'Leptospirosis',
					category: 'VACCINE',
					iva: 0.1,
					providerId: supplier.id,
					code: `PROD-${genRandomStr()}`,
					costs: { create: { cost: 12000 } },
					prices: { create: { amount: 36000 } },
				},
			},
		},
		{
			name: 'Parvovirus',
			species: { connect: { id: species1.id } },
			manufacturer: { connect: { id: man3.id } },
			batch: {
				create: {
					code: `${genRandomStr()}`,
					manufacturerId: man3.id,
				},
			},
			product: {
				create: {
					name: 'Parvovirus',
					category: 'VACCINE',
					providerId: supplier.id,
					iva: 0.1,
					code: `PROD-${genRandomStr()}`,
					costs: { create: { cost: 11000 } },
					prices: { create: { amount: 60000 } },
				},
			},
		},
	];
	for (const v of vaccinesData) {
		await db.vaccine.create({ data: v });
	}
};

export const seedVaccineRegistries = async (db: PrismaTransactionClient) => {
	const [vacc1, vacc2, vacc3] = await db.vaccine.findMany();
	const [pet1, pet2, pet3] = await db.pet.findMany();
	const today = new Date();
	const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
	const registriesData: Prisma.VaccineRegistryCreateInput[] = [
		{
			pet: { connect: { id: pet1.id } },
			vaccine: { connect: { id: vacc1.id } },
			dose: 1.5,
			applicationDate: today,
			expectedDate: today,
		},
		{
			pet: { connect: { id: pet2.id } },
			vaccine: { connect: { id: vacc2.id } },
			dose: 1.75,
			expectedDate: tomorrow,
		},
		{
			pet: { connect: { id: pet3.id } },
			vaccine: { connect: { id: vacc3.id } },
			dose: 1.25,
			applicationDate: today,
			expectedDate: today,
		},
	];
	for (const r of registriesData) {
		await db.vaccineRegistry.create({ data: r });
	}
};

export const seedStock = async (db: PrismaTransactionClient) => {
	const [prod1, prod2, prod3] = await db.product.findMany({
		select: { id: true },
	});
	const stockData: Prisma.StockCreateInput[] = [
		{
			address: 'Av. Caballero 800',
			name: 'Deposito Original',
			details: { create: { productId: prod1.id, amount: 12 } },
		},
		{
			address: 'Av. Irrazabal 976',
			name: 'Deposito Reserva',
			details: { create: { productId: prod2.id, amount: 10 } },
		},
		{
			address: 'Av. Japon 111',
			name: 'Deposito Extra',
			details: {
				create: {
					productId: prod3.id,
					amount: 15,
				},
			},
		},
	];
	for (const s of stockData) {
		await db.stock.create({ data: s });
	}
};

export const genRandomStr = () =>
	`${Math.floor(Math.random() * 1000)}${Date.now()}`;
