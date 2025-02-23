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
    try{
      const pet = await this.prisma.pet.create({
        data: createPetDto
      });
      return pet;
    }catch(error){
      throw new Error(`Error creando mascota ${error.menssaje}`);
    }
  }

  async findAll(query: PetQueryDto) {
    const { species, race, page = 1, limit = 10 } = query;
    const where: Prisma.PetWhereInput = {};
  
    if (species) {
      where.species = { name: { contains: species, mode: 'insensitive' } };
    }
    if (race) {
      where.race = { name: { contains: race, mode: 'insensitive' } };
    }
  
    return this.prisma.pet.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      include: {
        species: true,
        race: true,
      },
    });
  }
  

  async findOne(id: number) {
    const pet = await this.prisma.pet.findUnique({
      where: {id},
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
        where: { id },
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
    try {
      const pet = await this.prisma.pet.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      return pet;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Mascota con id ${id} no encontrada`);
      }
      throw new Error(`Error eliminando mascota con id ${id}: ${error.message}`);
    }
  }
}
