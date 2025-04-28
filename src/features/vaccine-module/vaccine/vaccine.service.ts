import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVaccineDto } from './dto/create-vaccine.dto';
import { UpdateVaccineDto } from './dto/update-vaccine.dto';
import { Prisma } from '@prisma/client';
import { VaccineQueryDto } from './dto/vaccine-query.dto';
import { PrismaService } from '@features/prisma/prisma.service';
import { ProductService } from '@features/product-module/product/product.service';
import { VaccineDto } from './dto/vaccine.dto';

@Injectable()
export class VaccineService {
	constructor(
		private readonly db: PrismaService,
		private readonly productService: ProductService,
	) {}
	async create(createVaccineDto: CreateVaccineDto) {
		const { speciesId, manufacturerId, productImg, cost, iva, price, ...dto } =
			createVaccineDto;

		const [species, manufacturer] = await Promise.all([
			this.db.species.findUnique({ where: { id: speciesId } }),
			this.db.vaccineManufacturer.findUnique({
				where: { id: manufacturerId, deletedAt: null },
			}),
		]);

		if (!species || !manufacturer) {
			throw new NotFoundException('Especie o fabricante no encontrado.');
		}

		const newProduct = await this.productService.create({
			name: dto.name,
			description : dto.description,
			category: 'VACCINE',
			cost,
			iva,
			price,
			productImg,
		});

		return this.db.vaccine.create({
			data: {
				name: dto.name,
				species: { connect: { id: speciesId } },
				manufacturer: { connect: { id: manufacturerId } },
				product: { connect: { id: newProduct.id } },
			},
		});
	}

	async findAll(dto: VaccineQueryDto) {
		const { baseWhere } = this.db.getBaseWhere(dto);
		const where: Prisma.VaccineWhereInput = {
			...baseWhere,
			speciesId: dto.speciesId,
			manufacturerId: dto.manufacturerId,
			productId: dto.productId,
			name: { contains: dto.name, mode: 'insensitive' },
		};

		const [data, total] = await Promise.all([
			this.db.vaccine.findMany({
				...this.db.paginate(dto),
				include: {
					species: true,
					manufacturer: true,
					product: true,
				},
				where,
			}),
			this.db.vaccine.count({ where }),
		]);

		return this.db.getPagOutput({
			page: dto.page,
			size: dto.size,
			total,
			data,
		});
	}

	async findOne(id: number) {
		const vaccine = await this.db.vaccine.findUnique({
			...this.getInclude(),
			where: { id },
		});
		if (!vaccine) throw new NotFoundException(`Vacuna no encontrada`);
		return new VaccineDto(vaccine);
	}

	async update(id: number, updateVaccineDto: UpdateVaccineDto) {
		const existingVaccine = await this.db.vaccine.findUnique({
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
				description: updateVaccineDto.description,
				cost: cost ?? existingVaccine.product.cost.toNumber(),
				category: 'VACCINE',
				iva: iva ?? existingVaccine.product.iva,
				price: price ?? existingVaccine.product.priceId,
			});
		}

		return this.db.vaccine.update({
			where: { id },
			data: {
				name : vaccineUpdateData.name,
				species: speciesId ? { connect: { id: speciesId } } : undefined,
				manufacturer: manufacturerId
					? { connect: { id: manufacturerId } }
					: undefined,
				product: { connect: { id: existingVaccine.product.id } },
			},
		});
	}

	async remove(id: number) {
		const vaccine = await this.db.vaccine.findUnique({
			where: { id },
			select: { id: true, product: { select: { id: true } } },
		});
		if (!vaccine) throw new NotFoundException('Vacuna no encontrada.');
		await this.db.product.softDelete({ id: vaccine.product.id });
		await this.db.vaccine.softDelete({ id });
	}

	private getInclude() {
		return {
			include: {
				species: true,
				manufacturer: true,
				product: {
					include: {
						price: true,
						image: true,
						tags: { include: { tag: true } },
					},
				},
			},
		};
	}
}
