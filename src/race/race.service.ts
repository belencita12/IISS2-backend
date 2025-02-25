import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRaceDto } from './dto/create-race.dto';
import { UpdateRaceDto } from './dto/update-race.dto';
import { PrismaService } from '@/prisma.service';
import { Prisma } from '@prisma/client';
import { RaceQueryDto } from './dto/race-query.dto';

@Injectable()
export class RaceService {

  constructor(private prisma: PrismaService){}

  async create(createRaceDto: CreateRaceDto) {
    const speciesExists = await this.prisma.species.findUnique({
      where: { id: createRaceDto.speciesId, deletedAt: null }, 
    });

    if (!speciesExists) {
        throw new NotFoundException(`Especie con ID ${createRaceDto.speciesId} no existe o fue eliminada`);
    }

    return this.prisma.race.create({
        data: createRaceDto,
    });
  }

  async findAll(query: RaceQueryDto) {
    const { name, speciesId, page = 1, limit = 10 } = query;
    const where: Prisma.RaceWhereInput = {};

    if (name) {
        where.name = { contains: name, mode: 'insensitive' };
    }

    if (speciesId) {
        where.speciesId = speciesId;
    }

    return this.prisma.race.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        include: {
            species: true,
            pets: { where: { deletedAt: null } },
        },
    });
  }

  async findOne(id: number) {
    const race = await this.prisma.race.findUnique({
      where: {id, deletedAt: null},
      include:{
        species: true,
        pets: true,
      }
    });
    if (!race) {
      throw new NotFoundException(`Race with ID ${id} not found`);
    }
    return race;
  }

  async update(id: number, updateRaceDto: UpdateRaceDto) {
    try{
      const race = await this.prisma.race.update({
        where: { id , deletedAt: null},
        data: updateRaceDto,
      });
      return race;
    }catch(error){
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Raza con id ${id} no encontrada`);
      }
       throw new Error(`Error actualizando raza con id ${id}: ${error.message}`);  
    }
  }

  async remove(id: number) {
    const race = await this.prisma.race.findFirst({ where: { id, deletedAt: null } });
    if (!race) {
        throw new NotFoundException(`Especie con id ${id} no encontrada o ya eliminada`);
    }
    return this.prisma.race.update({
        where: { id },
        data: { deletedAt: new Date() }, 
    });
  }
}
