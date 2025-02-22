import { Injectable } from '@nestjs/common';
import { CreateSpeciesDto } from './dto/create-species.dto';
import { UpdateSpeciesDto } from './dto/update-species.dto';
import { PrismaService } from '@/prisma.service';

@Injectable()
export class SpeciesService {

  constructor(private prisma: PrismaService){}

  async create(createSpeciesDto: CreateSpeciesDto) {
    return this.prisma.species.create({
      data: createSpeciesDto,
    });
  }

  async findAll() {
    return this.prisma.species.findMany({
      include:{
        races: true,
        pets: true,
      }

    });
  }

  async findOne(id: number) {
    return this.prisma.species.findUnique({
      where: {id},
      include:{
        races: true,
        pets: true,
      }
    });
  }

  async update(id: number, updateSpeciesDto: UpdateSpeciesDto) {
    return this.prisma.species.update({
      where: {id},
      data: updateSpeciesDto,
    });
  }

  async remove(id: number) {
    return this.prisma.species.delete({
      where: {id},
    });
  }
}
