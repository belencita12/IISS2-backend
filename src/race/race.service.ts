import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRaceDto } from './dto/create-race.dto';
import { UpdateRaceDto } from './dto/update-race.dto';
import { PrismaService } from '@/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class RaceService {

  constructor(private prisma: PrismaService){}

  async create(createRaceDto: CreateRaceDto) {
    try{
      const race = await this.prisma.race.create({
        data: createRaceDto,
      });
      return race;
    }catch(error){
      throw new Error(`Error creando raza ${error.menssaje}`)
    }
  }

  async findAll() {
    const race = await this.prisma.race.findMany({
      include: {
        species: true,
        pets: true,
      }
    });
    return race;
  }

  async findOne(id: number) {
    const race = await this.prisma.race.findUnique({
      where: {id},
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
        where: { id },
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
    try{
      const race = await this.prisma.race.delete({
        where:{id},
      });
      return race;
    }catch(error){
     if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Raza con id ${id} no encontrada`);
      }
      throw new Error(`Error actualizando raza con id ${id}: ${error.message}`);
    }
  }
}
