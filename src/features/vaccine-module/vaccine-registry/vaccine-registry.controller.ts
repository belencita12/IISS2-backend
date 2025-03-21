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
import { VaccineRegistryService } from './vaccine-registry.service';
import { CreateVaccineRegistryDto } from './dto/create-vaccine-registry.dto';
import { UpdateVaccineRegistryDto } from './dto/update-vaccine-registry.dto';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { VaccineRegistryDto } from './dto/vaccine-registry.dto';
import { VaccineRegistryQueryDto } from './dto/vaccine-registry-query.dto';
import { Role } from '@lib/constants/role.enum';
import { ApiPaginatedResponse } from '@lib/decorators/api-pagination-response.decorator';
import { Roles } from '@lib/decorators/roles.decorators';
import { RolesGuard } from '@lib/guard/role.guard';

@ApiBearerAuth('access-token')
@ApiTags('vaccine-registry')
@Controller('vaccine-registry')
@UseGuards(RolesGuard)
@Roles(Role.Admin)
export class VaccineRegistryController {
	constructor(
		private readonly vaccineRegistryService: VaccineRegistryService,
	) {}

	@UseGuards(RolesGuard)
	@Roles(Role.Admin)
	@Post()
	@ApiResponse({ type: VaccineRegistryDto })
	@ApiBody({ type: CreateVaccineRegistryDto })
	async create(@Body() createVaccineRegistryDto: CreateVaccineRegistryDto) {
		return this.vaccineRegistryService.create(createVaccineRegistryDto);
	}

	@UseGuards(RolesGuard)
	@Roles(Role.Admin, Role.User)
	@Get()
	@ApiPaginatedResponse(VaccineRegistryDto)
	findAll(@Query() query: VaccineRegistryQueryDto) {
		return this.vaccineRegistryService.findAll(query);
	}

	@UseGuards(RolesGuard)
	@Roles(Role.Admin, Role.User)
	@Get(':id')
	@ApiResponse({ type: VaccineRegistryDto })
	findOne(@Param('id') id: string) {
		return this.vaccineRegistryService.findOne(+id);
	}

	@UseGuards(RolesGuard)
	@Roles(Role.Admin)
	@Patch(':id')
	@ApiResponse({ type: VaccineRegistryDto })
	update(
		@Param('id') id: string,
		@Body() updateVaccineRegistryDto: UpdateVaccineRegistryDto,
	) {
		return this.vaccineRegistryService.update(+id, updateVaccineRegistryDto);
	}
	@UseGuards(RolesGuard)
	@Roles(Role.Admin)
	@Delete(':id')
	@ApiResponse({ type: VaccineRegistryDto })
	remove(@Param('id') id: string) {
		return this.vaccineRegistryService.remove(+id);
	}
}
