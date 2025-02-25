import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { PrismaService } from '@/prisma.service';
import { Prisma } from '@prisma/client';
import { PetQueryDto } from './dto/pet-query.dto';

@Injectable()
export class PetService {

  constructor(private prisma: PrismaService){}
  async create(createPetDto: CreatePetDto) {
    const speciesExists = await this.prisma.species.findUnique({
      where: { id: createPetDto.speciesId, deletedAt: null }, 
    });
    if (!speciesExists) {
      throw new NotFoundException(`Especie con ID ${createPetDto.speciesId} no existe o fue eliminada`);
    }
    if (createPetDto.raceId) {
      const raceExists = await this.prisma.race.findUnique({
        where: { id: createPetDto.raceId, deletedAt: null }, 
      });
      if (!raceExists) {
        throw new NotFoundException(`Raza con ID ${createPetDto.raceId} no existe o fue eliminada`);
      }
    }
    return this.prisma.pet.create({
      data: createPetDto,
    });
  }
  

  async findAll(query: PetQueryDto) {
    const { speciesId, raceId, page = 1, limit = 10 } = query;
    const where: Prisma.PetWhereInput = { 
      deletedAt: null
    };
    if (speciesId) {
      where.speciesId = speciesId;
    }
    if (raceId) {
      where.raceId = raceId;
    }
    const pets= await this.prisma.pet.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      include: {
        species: true, 
        race: true,
      },
    });
    const filteredPets = pets.map(pet => ({
      ...pet,
      species: pet.species?.deletedAt ? null : pet.species,
      race: pet.race?.deletedAt ? null : pet.race
    }));
    return filteredPets;
  }
  

  async findOne(id: number) {
    const pet = await this.prisma.pet.findFirst({
      where: {id, deletedAt: null},
      include: {
        species: true,
        race: true,
      },
    });
    if(!pet){
      throw new NotFoundException(`Mascota con id ${id} no encontrada`)
    }
    return pet;
  }

  async update(id: number, updatePetDto: UpdatePetDto) {
    try {
      const pet = await this.prisma.pet.update({
        where: { id, deletedAt: null },
        data: { ...updatePetDto, updatedAt: new Date() },
      });
      return pet;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Mascota con id ${id} no encontrada`);
      }
      throw new Error(`Error actualizando mascota con id ${id}: ${error.message}`);
    }
  }

  async remove(id: number) {
    const pet = await this.prisma.pet.findFirst({ where: { id, deletedAt: null } });
    if (!pet) {
        throw new NotFoundException(`Mascota con id ${id} no encontrada o ya eliminada`);
    }
    return this.prisma.pet.update({
        where: { id },
        data: { deletedAt: new Date() }, 
    });
  }
}
