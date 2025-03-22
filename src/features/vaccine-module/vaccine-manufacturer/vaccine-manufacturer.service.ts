import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVaccineManufacturerDto } from './dto/create-vaccine-manufacturer.dto';
import { UpdateVaccineManufacturerDto } from './dto/update-vaccine-manufacturer.dto';
import { VaccineManufacturerQueryDto } from './dto/vaccine-manufacturer-query.dto';
import { PrismaService } from '@features/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class VaccineManufacturerService {
	constructor(private prisma: PrismaService) {}

	async create(createVaccineManufacturerDto: CreateVaccineManufacturerDto) {
		return this.prisma.vaccineManufacturer.create({
			data: createVaccineManufacturerDto,
		});
	}

	async findAll(dto: VaccineManufacturerQueryDto) {
		const { baseWhere } = this.prisma.getBaseWhere(dto);

		const where: Prisma.VaccineManufacturerWhereInput = {
			...baseWhere,
			name: { contains: dto.name, mode: 'insensitive' },
		};

		const [data, total] = await Promise.all([
			this.prisma.vaccineManufacturer.findMany({
				...this.prisma.paginate(dto),
				where,
			}),
			this.prisma.vaccineManufacturer.count({ where }),
		]);

		return this.prisma.getPagOutput({
			page: dto.page,
			size: dto.size,
			total,
			data,
		});
	}

	async findOne(id: number) {
		const manufacturer = await this.prisma.vaccineManufacturer.findUnique({
			where: { id },
			include: {
				batch: true,
				vaccine: true,
			},
		});
		if (!manufacturer)
			throw new NotFoundException('Fabricante de vacuna no encontrada');
		return manufacturer;
	}

	async update(
		id: number,
		updateVaccineManufacturerDto: UpdateVaccineManufacturerDto,
	) {
		const prevVaccMan = await this.prisma.vaccineManufacturer.findFirst({
			where: { id },
		});
		if (!prevVaccMan)
			throw new NotFoundException('Fabricante de vacuna no encontrado');
		const manufacturer = await this.prisma.vaccineManufacturer.update({
			where: { id },
			data: updateVaccineManufacturerDto,
		});
		return manufacturer;
	}

	async remove(id: number) {
		const exists = await this.prisma.vaccineManufacturer.isExists({ id });
		if (!exists)
			throw new NotFoundException('Fabricante de vacuna no encontrado');
		return this.prisma.vaccineManufacturer.softDelete({ id });
	}
}
