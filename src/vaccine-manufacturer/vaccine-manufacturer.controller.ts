import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { VaccineManufacturerService } from './vaccine-manufacturer.service';
import { CreateVaccineManufacturerDto } from './dto/create-vaccine-manufacturer.dto';
import { UpdateVaccineManufacturerDto } from './dto/update-vaccine-manufacturer.dto';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { VaccineManufacturerDto } from './dto/vaccine-manufacturer.dto';
import { ApiPaginatedResponse } from '@/lib/decorators/api-pagination-response.decorator';
import { VaccineManufacturerQueryDto } from './dto/vaccine-manufacture-queryr.dto';
import { RolesGuard } from '@/lib/guard/role.guard';
import { Roles } from '@/lib/decorators/roles.decorators';
import { Role } from '@/lib/constants/role.enum';

@ApiBearerAuth('access-token')
@ApiTags('vaccine-manufacturer')
@Controller('vaccine-manufacturer')
@UseGuards(RolesGuard)
@Roles(Role.Admin)
export class VaccineManufacturerController {
  constructor(private readonly vaccineManufacturerService: VaccineManufacturerService) {}

  @Post()
  @ApiResponse({ type: VaccineManufacturerDto })
  @ApiBody({ type: CreateVaccineManufacturerDto})
  async create(@Body() createVaccineManufacturerDto: CreateVaccineManufacturerDto) {
    return this.vaccineManufacturerService.create(createVaccineManufacturerDto);
  }

  @Get()
  @ApiPaginatedResponse(VaccineManufacturerDto)
  async findAll(@Query() query: VaccineManufacturerQueryDto) {
    return this.vaccineManufacturerService.findAll(query);
  }

  @Get(':id')
  @ApiResponse({ type: VaccineManufacturerDto})
  async findOne(@Param('id') id: string) {
    return this.vaccineManufacturerService.findOne(+id);
  }

  @Patch(':id')
  @ApiResponse({ type: VaccineManufacturerDto})
  async update(@Param('id') id: string, @Body() updateVaccineManufacturerDto: UpdateVaccineManufacturerDto) {
    return this.vaccineManufacturerService.update(+id, updateVaccineManufacturerDto);
  }

  @Delete(':id')
  @ApiResponse({ type: VaccineManufacturerDto})
  async remove(@Param('id') id: string) {
    return this.vaccineManufacturerService.remove(+id);
  }
}
