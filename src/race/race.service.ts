import { Injectable } from '@nestjs/common';
import { CreateRaceDto } from './dto/create-race.dto';
import { UpdateRaceDto } from './dto/update-race.dto';
import { PrismaService } from '@/prisma.service';

@Injectable()
export class RaceService {

  constructor(private prisma: PrismaService){}

  async create(createRaceDto: CreateRaceDto) {
    return this.prisma.race.create({
      data: createRaceDto,
    });
  }

  async findAll() {
    return this.prisma.race.findMany({
      include: {
        species: true,
        pets: true,
      }
    });
  }

  async findOne(id: number) {
    return this.prisma.race.findUnique({
      where: {id},
      include:{
        species: true,
        pets: true,
      }
    });
  }

  async update(id: number, updateRaceDto: UpdateRaceDto) {
    return this.prisma.race.update({
      where: {id},
      data: updateRaceDto,
    });
  }

  async remove(id: number) {
    return this.prisma.race.delete({
      where:{id},
    });
  }
}
