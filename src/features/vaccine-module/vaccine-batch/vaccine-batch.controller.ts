import { Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { VaccineBatchService } from './vaccine-batch.service';
import { CreateVaccineBatchDto } from './dto/create-vaccine-batch.dto';
import { UpdateVaccineBatchDto } from './dto/update-vaccine-batch.dto';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { VaccineBatchDto } from './dto/vaccine-batch.dto';
import { VaccineBatchQueryDto } from './dto/vaccine-batch-query.dto';
import { ApiPaginatedResponse } from '@lib/decorators/documentation/api-pagination-response.decorator';
import { AdminOnly } from '@lib/decorators/auth/admin-only.decorator';
import { AppController } from '@lib/decorators/router/app-controller.decorator';

@AppController({ name: 'vaccine-batch', tag: 'Vaccine Batch' })
@AdminOnly()
export class VaccineBatchController {
	constructor(private readonly vaccineBatchService: VaccineBatchService) {}

	@Post()
	@ApiResponse({ type: VaccineBatchDto })
	@ApiBody({ type: CreateVaccineBatchDto })
	async create(@Body() createVaccineBatchDto: CreateVaccineBatchDto) {
		return this.vaccineBatchService.create(createVaccineBatchDto);
	}

	@Get()
	@ApiPaginatedResponse(VaccineBatchQueryDto)
	async findAll(@Query() query: VaccineBatchQueryDto) {
		return this.vaccineBatchService.findAll(query);
	}

	@Get(':id')
	@ApiResponse({ type: VaccineBatchDto })
	async findOne(@Param('id') id: string) {
		return this.vaccineBatchService.findOne(+id);
	}

	@Patch(':id')
	@ApiResponse({ type: VaccineBatchDto })
	async update(
		@Param('id') id: string,
		@Body() updateVaccineBatchDto: UpdateVaccineBatchDto,
	) {
		return this.vaccineBatchService.update(+id, updateVaccineBatchDto);
	}

	@Delete(':id')
	@ApiResponse({ type: VaccineBatchDto })
	async remove(@Param('id') id: string) {
		return this.vaccineBatchService.remove(+id);
	}
}
