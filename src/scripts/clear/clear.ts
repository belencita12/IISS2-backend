import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import { BUCKET, SUPABASE_ANON, SUPABASE_LINK } from '../seed/images';

export const seeder = async () => {
	const client = createClient(SUPABASE_LINK, SUPABASE_ANON);
	const db = new PrismaClient();
	await db.$transaction(async (tx) => {
		await tx.role.deleteMany();
		console.log('Roles were deleted successfully\n');
		await tx.vaccineBatch.deleteMany();
		console.log('VaccineBatches were deleted successfully\n');
		await tx.employee.deleteMany();
		console.log('Employees were deleted successfully\n');
		await tx.vaccineRegistry.deleteMany();
		console.log('VaccineRegistries were deleted successfully\n');
		await tx.pet.deleteMany();
		console.log('Pets were deleted successfully\n');
		await tx.user.deleteMany();
		console.log('Users were deleted successfully\n');
		await tx.vaccine.deleteMany();
		console.log('Vaccines were deleted successfully\n');
		await tx.product.deleteMany();
		console.log('Products were deleted successfully\n');
		await tx.workShift.deleteMany();
		console.log('WorkShifts were deleted successfully\n');
		await tx.workPosition.deleteMany();
		console.log('WorkPositions were deleted successfully\n');
		await tx.vaccineManufacturer.deleteMany();
		console.log('VaccineManufacturers were deleted successfully\n');
		await tx.productPrice.deleteMany();
		console.log('ProductPrices were deleted successfully\n');
		await tx.image.deleteMany();
		console.log('Images were deleted successfully\n');
		await tx.jwtBlackList.deleteMany();
		console.log('JwtBlackLists were deleted successfully\n');
		await tx.race.deleteMany();
		console.log('Races were deleted successfully\n');
		await tx.species.deleteMany();
		console.log('Species were deleted successfully\n');
		const { error } = await client.storage.emptyBucket(BUCKET);
		if (error) throw new Error(error.message);
		console.log('Bucket were cleaned successfully\n');
	});
	await db.$disconnect();
};

seeder()
	.then(() => {
		console.log('The DB was cleared successfully');
	})
	.catch((err) => {
		console.error("The DB can't be cleared", err);
	});
