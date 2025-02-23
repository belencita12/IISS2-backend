import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSpeciesDto } from './dto/create-species.dto';
import { UpdateSpeciesDto } from './dto/update-species.dto';
import { PrismaService } from '@/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SpeciesService {

  constructor(private prisma: PrismaService){}

  async create(createSpeciesDto: CreateSpeciesDto) {
    try {
      const species = await this.prisma.species.create({
        data: createSpeciesDto,
      });
      return species;
    } catch(error){
      throw new Error(`Error creando especie ${error.menssaje}`);
    }
  }

  async findAll() {
    const species = await this.prisma.species.findMany({
      include:{
        races: true,
        pets: true,
      }
    });
    return species;
  }

  async findOne(id: number) {
    const species = await this.prisma.species.findUnique({
      where: {id},
      include:{
        races: true,
        pets: true,
      }
    });
    if(!species){
      throw new NotFoundException(`Especie con id ${id} no encontrada`)
    }
    return species;
  }

  async update(id: number, updateSpeciesDto: UpdateSpeciesDto) {
    try{
      const species= await this.prisma.species.update({
        where: {id},
        data: updateSpeciesDto,
      });
      return species;
    }catch(error){
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Especie con id ${id} no encontrada`);
      }
      throw new Error(`Error actualizando especie con id ${id}: ${error.message}`);
    }
  }

  async remove(id: number) {
    try{
      const species = this.prisma.species.delete({
        where: {id},
      });

      return species;
    }catch(error){
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Especie con id ${id} no encontrada`);
      }
      throw new Error(`Error actualizando especie con id ${id}: ${error.message}`);
    }
  }
}
