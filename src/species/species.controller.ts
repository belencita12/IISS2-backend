import {
	Controller,
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
import { ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger';
import { SpeciesDto } from './dto/species.dto';
import { SpeciesQueryDto } from './dto/species-query.dto';
import { ApiPaginatedResponse } from '@/lib/decorators/api-pagination-response.decorator';
import { RolesGuard } from '@/lib/guard/role.guard';
import { Roles } from '@/lib/decorators/roles.decorators';
import { Role } from '@/lib/constants/role.enum';

@Controller('species')
@ApiTags('Species')
export class SpeciesController {
	constructor(private readonly speciesService: SpeciesService) {}

	@UseGuards(RolesGuard)
	@Roles(Role.Admin)
	@Post()
	@ApiResponse({ type: SpeciesDto })
	@ApiBody({ type: CreateSpeciesDto })
	async create(@Body() createSpeciesDto: CreateSpeciesDto) {
		return this.speciesService.create(createSpeciesDto);
	}

	@UseGuards(RolesGuard)
	@Roles(Role.Admin, Role.User)
	@Get()
	@ApiPaginatedResponse(SpeciesDto)
	async findAll(@Query() query: SpeciesQueryDto) {
		return this.speciesService.findAll(query);
	}

	@UseGuards(RolesGuard)
	@Roles(Role.Admin, Role.User)
	@Get(':id')
	@ApiResponse({ type: SpeciesDto })
	async findOne(@Param('id') id: string) {
		return this.speciesService.findOne(+id);
	}

	@UseGuards(RolesGuard)
	@Roles(Role.Admin)
	@Patch(':id')
	@ApiResponse({ type: SpeciesDto })
	async update(
		@Param('id') id: string,
		@Body() updateSpeciesDto: UpdateSpeciesDto,
	) {
		return this.speciesService.update(+id, updateSpeciesDto);
	}

	@UseGuards(RolesGuard)
	@Roles(Role.Admin)
	@Delete(':id')
	@ApiResponse({ type: SpeciesDto })
	async remove(@Param('id') id: string) {
		return this.speciesService.remove(+id);
	}
}
