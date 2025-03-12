import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVaccineBatchDto } from './dto/create-vaccine-batch.dto';
import { UpdateVaccineBatchDto } from './dto/update-vaccine-batch.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { VaccineBatchDto } from './dto/vaccine-batch.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class VaccineBatchService {
  constructor(private prisma:PrismaService){}
  
  async create(createVaccineBatchDto: CreateVaccineBatchDto) {
        const manufacturerExists = await this.prisma.vaccineManufacturer.findUnique({
          where: { id: createVaccineBatchDto.manufacturerId, deletedAt: null },
        });
    
        if (!manufacturerExists) {
          throw new NotFoundException(
            `fabricante de vacuna con ID ${createVaccineBatchDto.manufacturerId} no existe o fue eliminada`,
          );
        }
  
        return this.prisma.vaccineBatch.create({
          data: createVaccineBatchDto,
        });
  }

  async findAll(dto: VaccineBatchDto) {
    const { baseWhere } = this.prisma.getBaseWhere(dto);
        const where: Prisma.VaccineBatchWhereInput= {
          ...baseWhere,
          manufacturerId: dto.manufacturerId,
        };
    
        const [data, total] = await Promise.all([
          this.prisma.vaccineBatch.findMany({
            ...this.prisma.paginate(dto),
            where,
            include: { manufacturer: true },
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
			include: {
				manufacturer: true,
			},
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
          throw new Error(`Error actualizando lote de vacuna con id ${id}: ${error.message}`);
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
