import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SpeciesService } from './species.service';
import { CreateSpeciesDto } from './dto/create-species.dto';
import { UpdateSpeciesDto } from './dto/update-species.dto';
import { ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger';
import { SpeciesDto } from './dto/species.dto';
import { SpeciesQueryDto } from './dto/species-query.dto';

@Controller('species')
@ApiTags('Species')
export class SpeciesController {
  constructor(private readonly speciesService: SpeciesService) {}

  @Post()
  @ApiResponse({type: SpeciesDto})
  @ApiBody({type: CreateSpeciesDto})
  async create(@Body() createSpeciesDto: CreateSpeciesDto) {
    const species = await this.speciesService.create(createSpeciesDto);
    return new SpeciesDto(species);
  }

  @Get()
  @ApiResponse({type: [SpeciesDto]})
  async findAll(@Query() query: SpeciesQueryDto) {
    const speciesList= await this.speciesService.findAll();
    return speciesList.map((species)=> new SpeciesDto(species));
  }

  @Get(':id')
  @ApiResponse({type: SpeciesDto})
  async findOne(@Param('id') id: string) {
    const species = await this.speciesService.findOne(+id);
    return new SpeciesDto(species);  
  }

  @Patch(':id')
  @ApiResponse({ type: SpeciesDto })
  async update(@Param('id') id: string, @Body() updateSpeciesDto: UpdateSpeciesDto) {
    const updatedSpecies = await this.speciesService.update(+id, updateSpeciesDto);
    return new SpeciesDto(updatedSpecies);
  }

  @Delete(':id')
  @ApiResponse({ type: SpeciesDto })
  async remove(@Param('id') id: string) {
    const deletedSpecies = await this.speciesService.remove(+id);
    return new SpeciesDto(deletedSpecies);
  }
}
