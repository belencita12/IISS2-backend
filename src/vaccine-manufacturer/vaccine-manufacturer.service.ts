import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVaccineManufacturerDto } from './dto/create-vaccine-manufacturer.dto';
import { UpdateVaccineManufacturerDto } from './dto/update-vaccine-manufacturer.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { VaccineManufacturerQueryDto } from './dto/vaccine-manufacturer-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class VaccineManufacturerService {
  constructor(private prisma:PrismaService){}

  async create(createVaccineManufacturerDto: CreateVaccineManufacturerDto) {
    return this.prisma.vaccineManufacturer.create({
      data: createVaccineManufacturerDto,
    });
  }

  async findAll(dto: VaccineManufacturerQueryDto) {
       const { baseWhere } = this.prisma.getBaseWhere(dto);
   
      const where: Prisma.VaccineManufacturerWhereInput = {
        ...baseWhere,
        name: { contains: dto.name },
      };
   
      const [data, total] = await Promise.all([
        this.prisma.vaccineManufacturer.findMany({
          ...this.prisma.paginate(dto),
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
      where: { id, deletedAt: null },
      include: {
        batch: true,
        vaccine: true,
      },
    });
    if (!manufacturer) {
      throw new NotFoundException(`Fabricante de vacuna con id ${id} no encontrada`);
    }
    return manufacturer;
  }

  async update(id: number, updateVaccineManufacturerDto: UpdateVaccineManufacturerDto	) {
    try {
      const manufacturer = await this.prisma.vaccineManufacturer.update({
        where: { id, deletedAt: null },
        data: updateVaccineManufacturerDto,
      });
      return manufacturer;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Especie con id ${id} no encontrada`);
      }
      throw new Error(
        `Error actualizando especie con id ${id}: ${error.message}`,
      );
    }
  }

  async remove(id: number) {
    const manufacturer = await this.prisma.vaccineManufacturer.findFirst({
      where: { id, deletedAt: null },
    });
    if (!manufacturer) {
      throw new NotFoundException(
        `Especie con id ${id} no encontrada o ya eliminada`,
      );
    }
    return this.prisma.vaccineManufacturer.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
