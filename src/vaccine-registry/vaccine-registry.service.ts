import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVaccineRegistryDto } from './dto/create-vaccine-registry.dto';
import { UpdateVaccineRegistryDto } from './dto/update-vaccine-registry.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { VaccineRegistryQueryDto } from './dto/vaccine-registry-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class VaccineRegistryService {
	constructor(private prisma: PrismaService) {}

	async create(createVaccineRegistryDto: CreateVaccineRegistryDto) {
		const { vaccineId, petId, ...dto } = createVaccineRegistryDto;

		const [vaccine, pet] = await Promise.all([
			this.prisma.vaccine.findUnique({ where: { id: vaccineId } }),
			this.prisma.pet.findUnique({ where: { id: petId } }),
		]);

		if (![vaccine, pet].every(Boolean)) {
			throw new NotFoundException(
				`No se encontraron los siguientes registros: ${!vaccine ? `Vacuna(${vaccineId}) ` : ''}${!pet ? `Mascota(${petId})` : ''}`.trim(),
			);
		}

		return this.prisma.vaccineRegistry.create({
			data: {
				...dto,
				vaccine: { connect: { id: vaccineId } },
				pet: { connect: { id: petId } },
			},
		});
	}

	async findAll(dto: VaccineRegistryQueryDto) {
		const { baseWhere } = this.prisma.getBaseWhere(dto);
		const where: Prisma.VaccineRegistryWhereInput = {
			...baseWhere,
			vaccineId: dto.vaccineId,
			petId: dto.petId,
		};
		const [data, total] = await Promise.all([
			this.prisma.vaccineRegistry.findMany({
				...this.prisma.paginate(dto),
				where,
				include: { vaccine: true, pet: true },
			}),
			this.prisma.vaccineRegistry.count({ where }),
		]);
		return this.prisma.getPagOutput({
			page: dto.page,
			size: dto.size,
			total,
			data,
		});
	}

	async findOne(id: number) {
		const registry = await this.prisma.vaccineRegistry.findUnique({
			where: { id },
			include: { vaccine: true, pet: true },
		});

		if (!registry) {
			throw new NotFoundException(
				`registro de vacuna con ID ${id} no encontrada.`,
			);
		}

		return registry;
	}

	async update(id: number, updateVaccineRegistryDto: UpdateVaccineRegistryDto) {
		const registry = await this.prisma.vaccineRegistry.update({
			where: { id },
			data: updateVaccineRegistryDto,
		});
		return registry;
	}

	async remove(id: number) {
		const registry = await this.prisma.vaccineRegistry.findUnique({
			where: { id },
		});

		if (!registry) {
			throw new NotFoundException(
				`Registro de vacuna con ID ${id} no encontrado.`,
			);
		}

		return this.prisma.vaccineRegistry.update({
			where: { id },
			data: { deletedAt: new Date() },
		});
	}
}
