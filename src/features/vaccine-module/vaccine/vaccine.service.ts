import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVaccineDto } from './dto/create-vaccine.dto';
import { UpdateVaccineDto } from './dto/update-vaccine.dto';
import { Prisma } from '@prisma/client';
import { VaccineQueryDto } from './dto/vaccine-query.dto';
import { PrismaService } from '@features/prisma/prisma.service';
import { ProductService } from '@features/product-module/product/product.service';

@Injectable()
export class VaccineService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly productService: ProductService,
	) {}
	async create(createVaccineDto: CreateVaccineDto) {
		const { speciesId, manufacturerId, productImg, cost, iva, price, ...dto } =
			createVaccineDto;

		const [species, manufacturer] = await Promise.all([
			this.prisma.species.findUnique({ where: { id: speciesId } }),
			this.prisma.vaccineManufacturer.findUnique({
				where: { id: manufacturerId, deletedAt: null },
			}),
		]);

		if (!species || !manufacturer) {
			throw new NotFoundException('Especie o fabricante no encontrado.');
		}

		const newProduct = await this.productService.create({
			name: dto.name,
			category: 'VACCINE',
			cost,
			iva,
			price,
			productImg,
		});

		return this.prisma.vaccine.create({
			data: {
				...dto,
				species: { connect: { id: speciesId } },
				manufacturer: { connect: { id: manufacturerId } },
				product: { connect: { id: newProduct.id } },
			},
		});
	}

	async findAll(dto: VaccineQueryDto) {
		const { baseWhere } = this.prisma.getBaseWhere(dto);
		const where: Prisma.VaccineWhereInput = {
			...baseWhere,
			speciesId: dto.speciesId,
			manufacturerId: dto.manufacturerId,
			productId: dto.productId,
			name: { contains: dto.name, mode: 'insensitive' },
		};

		const [data, total] = await Promise.all([
			this.prisma.vaccine.findMany({
				...this.prisma.paginate(dto),
				where,
				include: { species: true, manufacturer: true, product: true },
			}),
			this.prisma.vaccine.count({ where }),
		]);

		return this.prisma.getPagOutput({
			page: dto.page,
			size: dto.size,
			total,
			data,
		});
	}

	async findOne(id: number) {
		const vaccine = await this.prisma.vaccine.findUnique({
			where: { id },
			include: {
				species: true,
				manufacturer: true,
				product: true,
			},
		});
		if (!vaccine) throw new NotFoundException(`Vacuna no encontrada`);
		return vaccine;
	}

	async update(id: number, updateVaccineDto: UpdateVaccineDto) {
		const existingVaccine = await this.prisma.vaccine.findUnique({
			where: { id },
			include: { product: true },
		});

		if (!existingVaccine) throw new NotFoundException('Vacuna no encontrada.');

		const {
			productImg,
			speciesId,
			manufacturerId,
			cost,
			iva,
			price,
			...vaccineUpdateData
		} = updateVaccineDto;

		if (productImg || updateVaccineDto.name || cost || iva || price) {
			await this.productService.update(existingVaccine.product.id, {
				productImg,
				name: updateVaccineDto.name ?? existingVaccine.product.name,
				cost: cost ?? existingVaccine.product.cost.toNumber(),
				category: 'VACCINE',
				iva: iva ?? existingVaccine.product.iva,
				price: price ?? existingVaccine.product.priceId,
			});
		}

		return this.prisma.vaccine.update({
			where: { id },
			data: {
				...vaccineUpdateData,
				species: speciesId ? { connect: { id: speciesId } } : undefined,
				manufacturer: manufacturerId
					? { connect: { id: manufacturerId } }
					: undefined,
				product: { connect: { id: existingVaccine.product.id } },
			},
		});
	}

	async remove(id: number) {
		const vaccine = await this.prisma.vaccine.findUnique({
			where: { id },
			select: { id: true, product: { select: { id: true } } },
		});
		if (!vaccine) throw new NotFoundException('Vacuna no encontrada.');
		await this.prisma.product.softDelete({ id: vaccine.product.id });
		await this.prisma.vaccine.softDelete({ id });
	}
}
