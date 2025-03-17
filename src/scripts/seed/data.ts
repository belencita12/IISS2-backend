import { Prisma, PrismaClient } from '@prisma/client';
import { hash } from '../../lib/utils/encrypt';
import { DefaultArgs } from '@prisma/client/runtime/library';

type PrismaTransactionClient = Omit<
	PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
	'$on' | '$connect' | '$disconnect' | '$use' | '$transaction' | '$extends'
>;

export const seedUsers = async (db: PrismaTransactionClient) => {
	const password = await hash('12345678');
	const users: Prisma.UserCreateInput[] = [
		{
			username: 'admin@example',
			password,
			fullName: 'Admin',
			email: 'admin@gmail.com',
			roles: { connect: [{ name: 'ADMIN' }] },
		},
		{
			username: 'user@example',
			password,
			roles: { connect: [{ name: 'USER' }] },
			fullName: 'User',
			email: 'user@gmail.com',
		},
		{
			username: 'adrian@example',
			password,
			roles: { connect: [{ name: 'USER' }] },
			fullName: 'Adrian Valgaba',
			email: 'adrian@gmail.com',
		},
		{
			username: 'employee_1@example',
			password,
			roles: { connect: [{ name: 'EMPLOYEE' }] },
			fullName: 'Employee 1',
			email: 'employee1@gmail.com',
		},
		{
			username: 'employee_2@example',
			password,
			roles: { connect: [{ name: 'EMPLOYEE' }] },
			fullName: 'Employee 2',
			email: 'employee2@gmail.com',
		},
	];
	for (const user of users) {
		await db.user.create({ data: user });
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
	const race = await db.race.findMany({ where: { speciesId: specie.id } });
	const users = await db.user.findMany({
		where: { roles: { some: { name: 'USER' } } },
	});
	const [user1, user2] = users;
	const [race1, race2, race3] = race;
	await db.pet.createMany({
		data: [
			{
				name: 'Luna',
				raceId: race1.id,
				userId: user1.id,
				speciesId: specie.id,
				weight: 5.5,
				sex: 'F',
				dateOfBirth,
			},
			{
				name: 'Max',
				raceId: race2.id,
				userId: user2.id,
				speciesId: specie.id,
				weight: 4.5,
				sex: 'M',
				dateOfBirth,
			},
			{
				name: 'Felix',
				raceId: race3.id,
				userId: user2.id,
				speciesId: specie.id,
				weight: 6.5,
				sex: 'M',
				dateOfBirth,
			},
		],
	});
};

export const seedWorkPositions = async (db: PrismaTransactionClient) => {
	const shiftsData = [
		{ startTime: '08:00:00', endTime: '12:00:00', weekDay: 1 },
		{ startTime: '14:00:00', endTime: '18:00:00', weekDay: 1 },
		{ startTime: '08:00:00', endTime: '12:00:00', weekDay: 2 },
		{ startTime: '14:00:00', endTime: '18:00:00', weekDay: 2 },
		{ startTime: '08:00:00', endTime: '12:00:00', weekDay: 3 },
		{ startTime: '14:00:00', endTime: '18:00:00', weekDay: 3 },
		{ startTime: '08:00:00', endTime: '12:00:00', weekDay: 4 },
		{ startTime: '14:00:00', endTime: '18:00:00', weekDay: 4 },
		{ startTime: '08:00:00', endTime: '12:00:00', weekDay: 5 },
		{ startTime: '14:00:00', endTime: '18:00:00', weekDay: 5 },
	];

	const workPositions: Prisma.WorkPositionCreateInput[] = [
		{
			name: 'Veterinario',
			shifts: { create: shiftsData },
		},
		{ name: 'Auxiliar', shifts: { create: shiftsData } },
	];

	for (const workPosition of workPositions) {
		await db.workPosition.create({ data: workPosition });
	}
};

export const seedEmployees = async (db: PrismaTransactionClient) => {
	const [{ id: employeeFirstId }, { id: employeeSecondId }] =
		await db.user.findMany({
			select: { id: true },
			where: { roles: { some: { name: 'EMPLOYEE' } } },
		});

	const [{ id: veterinarioId }, { id: auxiliarId }] =
		await db.workPosition.findMany({ select: { id: true } });

	const employeesData: Prisma.EmployeeCreateManyInput[] = [
		{
			ruc: '1234567-1',
			positionId: veterinarioId,
			userId: employeeFirstId,
		},
		{
			ruc: '7654321-2',
			positionId: auxiliarId,
			userId: employeeSecondId,
		},
	];
	await db.employee.createMany({ data: employeesData });
};

export const seedProducts = async (db: PrismaTransactionClient) => {
	const productsData: Prisma.ProductCreateInput[] = [
		{
			name: 'Desparasitante Perro',
			category: 'PRODUCT',
			code: `PROD-${genRandomStr()}`,
			cost: 20000,
			iva: 0.1,
			price: {
				create: {
					amount: 24000,
				},
			},
		},
		{
			name: 'Desparasitante Gato',
			category: 'PRODUCT',
			code: `PROD-${genRandomStr()}`,
			cost: 24000,
			iva: 0.1,
			price: {
				create: {
					amount: 28000,
				},
			},
		},
		{
			name: 'Pelota Juguete Perro',
			category: 'PRODUCT',
			code: `PROD-${genRandomStr()}`,
			cost: 18000,
			iva: 0.1,
			price: {
				create: {
					amount: 20000,
				},
			},
		},
		{
			name: 'Shampoo Perro 1Lt',
			category: 'PRODUCT',
			code: `PROD-${genRandomStr()}`,
			cost: 12000,
			iva: 0.1,
			price: {
				create: {
					amount: 15000,
				},
			},
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
					code: `PROD-${genRandomStr()}`,
					cost: 20000,
					price: { create: { amount: 50000 } },
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
					code: `PROD-${genRandomStr()}`,
					cost: 12000,
					price: { create: { amount: 36000 } },
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
					iva: 0.1,
					code: `PROD-${genRandomStr()}`,
					cost: 11000,
					price: { create: { amount: 60000 } },
				},
			},
		},
	];
	for (const v of vaccinesData) {
		await db.vaccine.create({ data: v });
	}
};
export const genRandomStr = () =>
	`${Math.floor(Math.random() * 1000)}${Date.now()}`;
