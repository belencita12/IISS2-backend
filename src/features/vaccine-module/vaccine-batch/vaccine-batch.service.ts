import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVaccineBatchDto } from './dto/create-vaccine-batch.dto';
import { UpdateVaccineBatchDto } from './dto/update-vaccine-batch.dto';
import { Prisma } from '@prisma/client';
import { VaccineBatchQueryDto } from './dto/vaccine-batch-query.dto';
import { PrismaService } from '@features/prisma/prisma.service';

@Injectable()
export class VaccineBatchService {
	constructor(private prisma: PrismaService) {}

	async create(createVaccineBatchDto: CreateVaccineBatchDto) {
		const { manufacturerId, vaccineId, ...dto } = createVaccineBatchDto;

		const [manufacturerExists, vaccineExists] = await Promise.all([
			this.prisma.vaccineManufacturer.isExists({ id: manufacturerId }),
			this.prisma.vaccine.isExists({ id: vaccineId }),
		]);
		if (!manufacturerExists)
			throw new NotFoundException('Fabricante de vacuna no encontrado');

		if (!vaccineExists) throw new NotFoundException('Vacuna no encontrada');

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
			where: { id },
			include: { manufacturer: true, vaccine: true },
		});
		if (!batch) throw new NotFoundException(`Lote no encontrado`);

		return batch;
	}

	async update(id: number, updateVaccineBatchDto: UpdateVaccineBatchDto) {
		const isExists = await this.prisma.vaccineBatch.isExists({ id });
		if (!isExists) throw new NotFoundException(`Lote no encontrado`);
		const batch = await this.prisma.vaccineBatch.update({
			where: { id, deletedAt: null },
			data: updateVaccineBatchDto,
		});
		return batch;
	}

	async remove(id: number) {
		const batch = await this.prisma.vaccineBatch.isExists({ id });
		if (!batch) throw new NotFoundException(`Lote no encontrado`);
		return this.prisma.vaccineBatch.update({
			where: { id },
			data: { deletedAt: new Date() },
		});
	}
}
