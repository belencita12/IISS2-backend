import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { RaceService } from './race.service';
import { CreateRaceDto } from './dto/create-race.dto';
import { UpdateRaceDto } from './dto/update-race.dto';
import { ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger';;
import { RaceQueryDto } from './dto/race-query.dto';
import { RaceDto } from './dto/race.dto';

@Controller('race')
@ApiTags('Race')
export class RaceController {
  constructor(private readonly raceService: RaceService) {}

  @Post()
    @ApiResponse({type: RaceDto })
    @ApiBody({type: CreateRaceDto})
  async create(@Body() createRaceDto: CreateRaceDto) {
    const race = await this.raceService.create(createRaceDto);
    return new RaceDto(race);
  }

  @Get()
  @ApiResponse({type: [RaceDto]})
  async findAll(@Query() query: RaceQueryDto) {
 const raceList= await this.raceService.findAll(query);
    return raceList.map((race)=> new RaceDto(race));

  }

  @Get(':id')
  @ApiResponse({type: RaceDto })
  async findOne(@Param('id') id: string) {
    const race = await this.raceService.findOne(+id);
    return new RaceDto(race); 
  }

  @Patch(':id')
  @ApiResponse({type: RaceDto })
  async update(@Param('id') id: number, @Body() updateRaceDto: UpdateRaceDto) {
    const updatedRace = await this.raceService.update(+id, updateRaceDto);
    return new RaceDto(updatedRace); 
  }

  @Delete(':id')
  @ApiResponse({type: RaceDto })
  async remove(@Param('id') id: number) {
      const deletedRace = await this.raceService.remove(+id);
      return new RaceDto(deletedRace);
  }
}
