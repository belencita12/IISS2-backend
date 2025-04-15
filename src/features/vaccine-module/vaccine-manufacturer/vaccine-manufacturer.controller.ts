import { Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { VaccineManufacturerService } from './vaccine-manufacturer.service';
import { CreateVaccineManufacturerDto } from './dto/create-vaccine-manufacturer.dto';
import { UpdateVaccineManufacturerDto } from './dto/update-vaccine-manufacturer.dto';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { VaccineManufacturerDto } from './dto/vaccine-manufacturer.dto';
import { VaccineManufacturerQueryDto } from './dto/vaccine-manufacturer-query.dto';
import { ApiPaginatedResponse } from '@lib/decorators/documentation/api-pagination-response.decorator';
import { AdminOnly } from '@lib/decorators/auth/admin-only.decorator';
import { AppController } from '@lib/decorators/router/app-controller.decorator';

@AppController({ name: 'vaccine-manufacturer', tag: 'Vaccine Manufacturer' })
@AdminOnly()
export class VaccineManufacturerController {
	constructor(
		private readonly vaccineManufacturerService: VaccineManufacturerService,
	) {}

	@Post()
	@ApiResponse({ type: VaccineManufacturerDto })
	@ApiBody({ type: CreateVaccineManufacturerDto })
	async create(
		@Body() createVaccineManufacturerDto: CreateVaccineManufacturerDto,
	) {
		return this.vaccineManufacturerService.create(createVaccineManufacturerDto);
	}

	@Get()
	@ApiPaginatedResponse(VaccineManufacturerDto)
	async findAll(@Query() query: VaccineManufacturerQueryDto) {
		return this.vaccineManufacturerService.findAll(query);
	}

	@Get(':id')
	@ApiResponse({ type: VaccineManufacturerDto })
	async findOne(@Param('id') id: string) {
		return this.vaccineManufacturerService.findOne(+id);
	}

	@Patch(':id')
	@ApiResponse({ type: VaccineManufacturerDto })
	async update(
		@Param('id') id: string,
		@Body() updateVaccineManufacturerDto: UpdateVaccineManufacturerDto,
	) {
		return this.vaccineManufacturerService.update(
			+id,
			updateVaccineManufacturerDto,
		);
	}

	@Delete(':id')
	@ApiResponse({ type: VaccineManufacturerDto })
	async remove(@Param('id') id: string) {
		return this.vaccineManufacturerService.remove(+id);
	}
}
