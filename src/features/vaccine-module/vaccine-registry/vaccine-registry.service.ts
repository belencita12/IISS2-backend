import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVaccineRegistryDto } from './dto/create-vaccine-registry.dto';
import { UpdateVaccineRegistryDto } from './dto/update-vaccine-registry.dto';
import { VaccineRegistryQueryDto } from './dto/vaccine-registry-query.dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@features/prisma/prisma.service';

@Injectable()
export class VaccineRegistryService {
	constructor(private readonly db: PrismaService) {}

	async create(dto: CreateVaccineRegistryDto) {
		const { vaccineId, petId, appointmentId, applicationDate, ...data } = dto;
		const currentDate = applicationDate || new Date().toISOString();

		const isVaccExists = await this.db.vaccine.isExists({ id: vaccineId });
		if (!isVaccExists) throw new NotFoundException('La vacuna no existe');

		const isPetExists = await this.db.pet.isExists({ id: petId });
		if (!isPetExists) throw new NotFoundException('La mascota no existe');

		if (appointmentId) {
			const isAppointmentExists = await this.db.appointment.isExists({
				id: appointmentId,
			});
			if (!isAppointmentExists)
				throw new NotFoundException('La cita no existe');
		}
		const dataToCreate: Prisma.VaccineRegistryCreateInput = {
			...data,
			vaccine: { connect: { id: vaccineId } },
			pet: { connect: { id: petId } },
			appointment: appointmentId
				? { connect: { id: appointmentId } }
				: undefined,
			applicationDate: currentDate,
		};
		return this.db.vaccineRegistry.create({
			data: dataToCreate,
		});
	}

	async findAll(dto: VaccineRegistryQueryDto) {
		const { baseWhere } = this.db.getBaseWhere(dto);
		const where: Prisma.VaccineRegistryWhereInput = {
			...baseWhere,
			...(dto.vaccineId ? { vaccineId: dto.vaccineId } : {}),
			...(dto.petId ? { petId: dto.petId } : {}),
			...(dto.clientName
				? {
						pet: {
							client: {
								user: {
									fullName: { contains: dto.clientName, mode: 'insensitive' },
								},
							},
						},
					}
				: {}),
			...(dto.toExpectedDate || dto.fromExpectedDate
				? {
						expectedDate: {
							gte: dto.fromExpectedDate,
							lte: dto.toExpectedDate,
						},
					}
				: {}),
			...(dto.toApplicationDate || dto.fromApplicationDate
				? {
						applicationDate: {
							gte: dto.fromApplicationDate,
							lte: dto.toApplicationDate,
						},
					}
				: {}),
		};

		const [data, total] = await Promise.all([
			this.db.vaccineRegistry.findMany({
				...this.db.paginate(dto),
				...this.getSelect(),
				orderBy: { expectedDate: 'desc' },
				where,
			}),
			this.db.vaccineRegistry.count({ where }),
		]);

		return this.db.getPagOutput({
			page: dto.page,
			size: dto.size,
			total,
			data,
		});
	}

	async findOne(id: number) {
		const registry = await this.db.vaccineRegistry.findUnique({
			where: { id },
			...this.getSelect(),
		});

		if (!registry) {
			throw new NotFoundException(
				`Registro de vacuna con ID ${id} no encontrado.`,
			);
		}

		return registry;
	}
	async update(id: number, dto: UpdateVaccineRegistryDto) {
		const registry = await this.db.vaccineRegistry.update({
			where: { id },
			data: dto,
		});
		return registry;
	}

	async remove(id: number) {
		const registry = await this.db.vaccineRegistry.isExists({ id });
		if (!registry) throw new NotFoundException(`Registro de vacuna no existe`);
		return await this.db.vaccineRegistry.softDelete({ id });
	}

	private getSelect() {
		return {
			select: {
				id: true,
				vaccineId: true,
				dose: true,
				petId: true,
				appointmentId: true,
				applicationDate: true,
				expectedDate: true,
				deletedAt: true,
				createdAt: true,
				updatedAt: true,
				pet: {
					select: {
						client: { select: { user: { select: { fullName: true } } } },
						name: true,
					},
				},
				vaccine: {
					select: {
						id: true,
						speciesId: true,
						name: true,
						productId: true,
						manufacturer: { select: { name: true } },
					},
				},
			},
		};
	}
}
