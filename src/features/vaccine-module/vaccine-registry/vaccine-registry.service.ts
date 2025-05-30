import {
	Injectable,
	NotFoundException,
	BadRequestException,
} from '@nestjs/common';
import { CreateVaccineRegistryDto } from './dto/create-vaccine-registry.dto';
import { UpdateVaccineRegistryDto } from './dto/update-vaccine-registry.dto';
import { VaccineRegistryQueryDto } from './dto/vaccine-registry-query.dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@features/prisma/prisma.service';
import Decimal from 'decimal.js';
import { genRandomCode } from '@lib/utils/encrypt';
@Injectable()
export class VaccineRegistryService {
	constructor(private readonly db: PrismaService) {}

	async create(dto: CreateVaccineRegistryDto) {
		const { vaccineId, petId, appointmentId, applicationDate, ...data } = dto;
		const currentDate = applicationDate || undefined;

		const isVaccExists = await this.db.vaccine.isExists({ id: vaccineId });
		if (!isVaccExists) throw new NotFoundException('La vacuna no existe');

		const isPetExists = await this.db.pet.isExists({ id: petId });
		if (!isPetExists) throw new NotFoundException('La mascota no existe');

		if (appointmentId) {
			const appointment = await this.db.appointment.findUnique({
				where: { id: appointmentId },
			});
			if (!appointment) throw new NotFoundException('La cita no existe');

			if (
				appointment.status === 'CANCELLED' ||
				appointment.status === 'COMPLETED'
			) {
				throw new BadRequestException(
					'No se puede asociar una vacuna a una cita cancelada o completada',
				);
			}

			let vaccineService = await this.db.serviceType.findUnique({
				where: { slug: 'aplicacion-vacuna' },
			});

			if (!vaccineService) {
				const created = await this.db.$transaction(async (tx) => {
					const product = await tx.product.create({
						data: {
							name: 'Aplicación de vacuna',
							iva: 21,
							category: 'SERVICE',
							code: genRandomCode(),
							costs: { create: { cost: new Decimal(40000) } },
							prices: { create: { amount: new Decimal(60000) } },
						},
					});

					return await tx.serviceType.create({
						data: {
							slug: 'aplicacion-vacuna',
							name: 'Aplicación de vacuna',
							description: 'Servicio para aplicación de vacuna',
							durationMin: 30,
							productId: product.id,
						},
					});
				});

				vaccineService = created;
			}

			const existingDetail = await this.db.appointmentDetail.findFirst({
				where: {
					appointmentId,
					serviceId: vaccineService.id,
					deletedAt: null,
				},
			});

			if (!existingDetail) {
				const startAt = appointment.designatedDate;
				const endAt = new Date(startAt.getTime() + 30 * 60000);

				await this.db.appointmentDetail.create({
					data: {
						appointmentId,
						serviceId: vaccineService.id,
						startAt,
						endAt,
						partialDuration: 30,
					},
				});
			}
		}
		const dataToCreate: Prisma.VaccineRegistryCreateInput = {
			...data,
			vaccine: { connect: { id: vaccineId } },
			pet: { connect: { id: petId } },
			appointment: appointmentId
				? { connect: { id: appointmentId } }
				: undefined,
			applicationDate: currentDate ? new Date(currentDate) : undefined,
			expectedDate: new Date(data.expectedDate),
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
