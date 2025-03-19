import { Prisma, PrismaClient } from '@prisma/client';
import { hash } from '../../lib/utils/encrypt';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { dogImgs, productsImgs, uploadImg } from './images';

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
			fullName: 'Florentino Valgaba',
			email: 'admin@gmail.com',
			roles: { connect: [{ name: 'ADMIN' }] },
		},
		{
			username: 'user@example',
			password,
			roles: { connect: [{ name: 'USER' }] },
			fullName: 'Augusto Gimenez',
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
			username: 'romeo@example',
			password,
			roles: { connect: [{ name: 'USER' }] },
			fullName: 'Romeo Lopez',
			email: 'romeo@gmail.com',
		},
		{
			username: 'employee_1@example',
			password,
			roles: { connect: [{ name: 'EMPLOYEE' }] },
			fullName: 'Fernando Valgaba',
			email: 'employee1@gmail.com',
		},
		{
			username: 'employee_2@example',
			password,
			roles: { connect: [{ name: 'EMPLOYEE' }] },
			fullName: 'Richard Valgaba',
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
	const race = await db.race.findMany({
		where: { speciesId: specie.id },
		orderBy: { name: 'asc' },
	});
	const users = await db.user.findMany({
		where: { roles: { some: { name: 'USER' } } },
	});
	const goldenImg = await uploadImg(dogImgs[0], db);
	const labradorImg = await uploadImg(dogImgs[1], db);
	const mestizoImg = await uploadImg(dogImgs[2], db);

	const [user1, user2, user3] = users;
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
			{
				name: 'Lea',
				raceId: race1.id,
				userId: user3.id,
				speciesId: specie.id,
				weight: 5.5,
				sex: 'F',
				dateOfBirth,
			},
			{
				name: 'Mike',
				raceId: race1.id,
				userId: user3.id,
				speciesId: specie.id,
				weight: 5.5,
				sex: 'M',
				dateOfBirth,
				imageId: labradorImg.id,
			},
			{
				name: 'Chulo',
				raceId: race1.id,
				userId: user3.id,
				speciesId: specie.id,
				weight: 5.5,
				sex: 'M',
				dateOfBirth,
				imageId: labradorImg.id,
			},
			{
				name: 'Zoco',
				raceId: race2.id,
				userId: user3.id,
				speciesId: specie.id,
				weight: 7.5,
				sex: 'M',
				dateOfBirth,
				imageId: goldenImg.id,
			},
			{
				name: 'Frufru',
				raceId: race3.id,
				userId: user3.id,
				speciesId: specie.id,
				weight: 3.5,
				sex: 'M',
				dateOfBirth,
				imageId: mestizoImg.id,
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
	const prod1Img = await uploadImg(productsImgs[0], db);
	const prod2Img = await uploadImg(productsImgs[1], db);
	const prod3Img = await uploadImg(productsImgs[2], db);
	const prod4Img = await uploadImg(productsImgs[3], db);

	const productsData: Prisma.ProductCreateInput[] = [
		{
			name: 'Desparasitante Perro',
			category: 'PRODUCT',
			code: `PROD-${genRandomStr()}`,
			cost: 20000,
			iva: 0.1,
			image: {
				connect: {
					id: prod1Img.id,
				},
			},
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
			image: {
				connect: {
					id: prod2Img.id,
				},
			},
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
			image: {
				connect: {
					id: prod3Img.id,
				},
			},
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
			image: {
				connect: {
					id: prod4Img.id,
				},
			},
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
