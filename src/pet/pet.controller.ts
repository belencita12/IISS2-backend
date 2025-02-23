import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PetService } from './pet.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PetDto } from './dto/pet.dto';
import { PetQueryDto } from './dto/pet-query.dto';

@Controller('pet')
@ApiTags('Pet')
export class PetController {
  constructor(private readonly petService: PetService) {}

  @Post()
  @ApiResponse({type: PetDto})
  @ApiBody({type: CreatePetDto})
  async create(@Body() createPetDto: CreatePetDto) {
    const pet = await this.petService.create(createPetDto);
    return new PetDto(pet);
  }

  @Get()
  @ApiResponse({type: [PetDto]})
  async findAll(@Query() query: PetQueryDto) {
    const petList = await this.petService.findAll(query);
    return petList.map((pet)=> new PetDto(pet));
  }

  @Get(':id')
  @ApiResponse({type: PetDto})
  async findOne(@Param('id') id: string) {
    const pet = await this.petService.findOne(+id);
    return new PetDto(pet);
  }

@Patch(':id')
  @ApiResponse({ type: PetDto })
  async update(@Param('id') id: string, @Body() updatePetDto: UpdatePetDto) {
    const updatedPet = await this.petService.update(+id, updatePetDto);
    return new PetDto(updatedPet);
  }

  @Delete(':id')
  @ApiResponse({ type: PetDto })
  async remove(@Param('id') id: string) {
    const deletedPet = await this.petService.remove(+id);
    return new PetDto(deletedPet);
  }
}
