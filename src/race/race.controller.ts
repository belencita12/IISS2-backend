import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { RaceService } from './race.service';
import { CreateRaceDto } from './dto/create-race.dto';
import { UpdateRaceDto } from './dto/update-race.dto';
import { ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger';;
import { RaceQueryDto } from './dto/race-query.dto';
import { RaceDto } from './dto/race.dto';
import { ApiPaginatedResponse } from '@/lib/decorators/api-pagination-response.decorator';

@Controller('race')
@ApiTags('Race')
export class RaceController {
  constructor(private readonly raceService: RaceService) {}

  @Post()
    @ApiResponse({type: RaceDto })
    @ApiBody({type: CreateRaceDto})
  async create(@Body() createRaceDto: CreateRaceDto) {
    return this.raceService.create(createRaceDto);
  }

  @Get()
  @ApiPaginatedResponse(RaceDto)
  async findAll(@Query() query: RaceQueryDto) {
    return this.raceService.findAll(query);
  }

  @Get(':id')
  @ApiResponse({type: RaceDto })
  async findOne(@Param('id') id: string) {
    return this.raceService.findOne(+id);
  }

  @Patch(':id')
  @ApiResponse({type: RaceDto })
  async update(@Param('id') id: string, @Body() updateRaceDto: UpdateRaceDto) {
    return this.raceService.update(+id, updateRaceDto);
  }

  @Delete(':id')
  @ApiResponse({type: RaceDto })
  async remove(@Param('id') id: string) {
    return this.raceService.remove(+id);
  }
}
