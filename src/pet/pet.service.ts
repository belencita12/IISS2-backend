import { Injectable } from '@nestjs/common';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { PrismaService } from '@/prisma.service';

@Injectable()
export class PetService {

  constructor(private prisma: PrismaService){}

  async create(createPetDto: CreatePetDto) {
    return this.prisma.pet.create({
      data: createPetDto
    });
  }

  async findAll() {
    return this.prisma.pet.findMany({
      include:{
        species: true,
        race: true,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.pet.findUnique({
      where: {id},
      include: {
        species: true,
        race: true,
      },
    });
  }

  async update(id: number, updatePetDto: UpdatePetDto) {
    return this.prisma.pet.update({
      where: {id},
      data:updatePetDto,
    });
  }

  async remove(id: number) {
    return this.prisma.pet.delete({
      where:{id},
    });
  }
}
