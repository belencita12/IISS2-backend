import {
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	Query,
	UseGuards,
} from '@nestjs/common';
import { SpeciesService } from './species.service';
import { CreateSpeciesDto } from './dto/create-species.dto';
import { UpdateSpeciesDto } from './dto/update-species.dto';
import { ApiResponse, ApiBody } from '@nestjs/swagger';
import { SpeciesDto } from './dto/species.dto';
import { SpeciesQueryDto } from './dto/species-query.dto';
import { Role } from '@lib/constants/role.enum';
import { ApiPaginatedResponse } from '@lib/decorators/documentation/api-pagination-response.decorator';
import { Roles } from '@lib/decorators/auth/roles.decorators';
import { RolesGuard } from '@lib/guard/role.guard';
import { AppController } from '@lib/decorators/router/app-controller.decorator';

@UseGuards(RolesGuard)
@AppController({ name: 'species', tag: 'Species' })
export class SpeciesController {
	constructor(private readonly speciesService: SpeciesService) {}

	@Roles(Role.Admin)
	@Post()
	@ApiResponse({ type: SpeciesDto })
	@ApiBody({ type: CreateSpeciesDto })
	async create(@Body() createSpeciesDto: CreateSpeciesDto) {
		return this.speciesService.create(createSpeciesDto);
	}

	@Roles(Role.Admin, Role.User)
	@Get()
	@ApiPaginatedResponse(SpeciesDto)
	async findAll(@Query() query: SpeciesQueryDto) {
		return this.speciesService.findAll(query);
	}

	@Roles(Role.Admin, Role.User)
	@Get(':id')
	@ApiResponse({ type: SpeciesDto })
	async findOne(@Param('id') id: string) {
		return this.speciesService.findOne(+id);
	}

	@Roles(Role.Admin)
	@Patch(':id')
	@ApiResponse({ type: SpeciesDto })
	async update(
		@Param('id') id: string,
		@Body() updateSpeciesDto: UpdateSpeciesDto,
	) {
		return this.speciesService.update(+id, updateSpeciesDto);
	}

	@Roles(Role.Admin)
	@Delete(':id')
	@ApiResponse({ type: SpeciesDto })
	async remove(@Param('id') id: string) {
		return this.speciesService.remove(+id);
	}
}
