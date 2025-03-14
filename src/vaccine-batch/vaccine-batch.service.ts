import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVaccineBatchDto } from './dto/create-vaccine-batch.dto';
import { UpdateVaccineBatchDto } from './dto/update-vaccine-batch.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { VaccineBatchQueryDto } from './dto/vaccine-batch-query.dto';

@Injectable()
export class VaccineBatchService {
	constructor(private prisma: PrismaService) {}

	async create(createVaccineBatchDto: CreateVaccineBatchDto) {
		const { manufacturerId, vaccineId, ...dto } = createVaccineBatchDto;

		const [manufacturerExists, vaccineExists] = await Promise.all([
			this.prisma.vaccineManufacturer.findUnique({
				where: { id: manufacturerId, deletedAt: null },
			}),
			this.prisma.vaccine.findUnique({
				where: { id: vaccineId, deletedAt: null },
			}),
		]);
		if (!manufacturerExists) {
			throw new NotFoundException(
				`fabricante de vacuna con ID ${createVaccineBatchDto.manufacturerId} no existe o fue eliminada`,
			);
		}
		if (!vaccineExists) {
			throw new NotFoundException(`Vacuna con ID ${vaccineId} no encontrada.`);
		}
		const vaccineBatch = await this.prisma.vaccineBatch.create({
			include: {
				manufacturer: { select: { name: true } },
				vaccine: { select: { name: true } },
			},
			data: {
				...dto,
				manufacturer: { connect: { id: manufacturerId } },
				vaccine: { connect: { id: vaccineId } },
			},
		});

		return vaccineBatch;
	}

	async findAll(dto: VaccineBatchQueryDto) {
		const { baseWhere } = this.prisma.getBaseWhere(dto);
		const where: Prisma.VaccineBatchWhereInput = {
			...baseWhere,
			manufacturerId: dto.manufacturerId,
			vaccineId: dto.vaccineId,
		};

		const [data, total] = await Promise.all([
			this.prisma.vaccineBatch.findMany({
				...this.prisma.paginate(dto),
				where,
				include: { manufacturer: true, vaccine: true },
			}),
			this.prisma.vaccineBatch.count({ where }),
		]);

		return this.prisma.getPagOutput({
			page: dto.page,
			size: dto.size,
			total,
			data,
		});
	}

	async findOne(id: number) {
		const batch = await this.prisma.vaccineBatch.findUnique({
			where: { id, deletedAt: null },
			include: { manufacturer: true, vaccine: true },
		});
		if (!batch) {
			throw new NotFoundException(`Batch with ID ${id} not found`);
		}
		return batch;
	}

	async update(id: number, updateVaccineBatchDto: UpdateVaccineBatchDto) {
		try {
			const batch = await this.prisma.vaccineBatch.update({
				where: { id, deletedAt: null },
				data: updateVaccineBatchDto,
			});
			return batch;
		} catch (error) {
			if (
				error instanceof Prisma.PrismaClientKnownRequestError &&
				error.code === 'P2025'
			) {
				throw new NotFoundException(`Lote con id ${id} no encontrada`);
			}
			throw new Error(
				`Error actualizando lote de vacuna con id ${id}: ${error.message}`,
			);
		}
	}

	async remove(id: number) {
		const batch = await this.prisma.vaccineBatch.findFirst({
			where: { id, deletedAt: null },
		});
		if (!batch) {
			throw new NotFoundException(
				`Lote con id ${id} no encontrada o ya eliminada`,
			);
		}
		return this.prisma.vaccineBatch.update({
			where: { id },
			data: { deletedAt: new Date() },
		});
	}
}
