import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVaccineDto } from './dto/create-vaccine.dto';
import { UpdateVaccineDto } from './dto/update-vaccine.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { VaccineQueryDto } from './dto/vaccine-query.dto';
import { ProductService } from '@/product/product.service';

@Injectable()
export class VaccineService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly productService: ProductService,
	) {}
	async create(createVaccineDto: CreateVaccineDto, img?: Express.Multer.File) {
		// Asignar img a productData.productImg si existe
		if (img && createVaccineDto.productData) {
			createVaccineDto.productData.productImg = img;
		}

		const { speciesId, manufacturerId, productData, ...dto } = createVaccineDto;

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
			name: productData?.name ?? 'Vacuna Genérica',
			category: productData?.category ?? 'VACCINE',
			cost: productData?.cost ?? 0,
			iva: productData?.iva ?? 0.1,
			price: productData?.price ?? 0,
			productImg: productData?.productImg,
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

		if (!vaccine) {
			throw new NotFoundException(`Vacuna con ID ${id} no encontrada.`);
		}

		return vaccine;
	}

	async update(id: number, updateVaccineDto: UpdateVaccineDto) {
		try {
			const vaccine = await this.prisma.vaccine.update({
				where: { id },
				data: updateVaccineDto,
			});
			return vaccine;
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
		const vaccine = await this.prisma.vaccine.findUnique({
			where: { id },
		});

		if (!vaccine) {
			throw new NotFoundException(`Vacuna con ID ${id} no encontrada.`);
		}
		return this.prisma.vaccine.update({
			where: { id },
			data: { deletedAt: new Date() },
		});
	}
}
