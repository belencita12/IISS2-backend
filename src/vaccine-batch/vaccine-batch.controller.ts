import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseGuards,
	Query,
} from '@nestjs/common';
import { VaccineBatchService } from './vaccine-batch.service';
import { CreateVaccineBatchDto } from './dto/create-vaccine-batch.dto';
import { UpdateVaccineBatchDto } from './dto/update-vaccine-batch.dto';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '@/lib/guard/role.guard';
import { Role } from '@/lib/constants/role.enum';
import { Roles } from '@/lib/decorators/roles.decorators';
import { VaccineBatchDto } from './dto/vaccine-batch.dto';
import { ApiPaginatedResponse } from '@/lib/decorators/api-pagination-response.decorator';

@ApiBearerAuth('access-token')
@ApiTags('vaccine-batch')
@Controller('vaccine-batch')
@UseGuards(RolesGuard)
@Roles(Role.Admin)
export class VaccineBatchController {
	constructor(private readonly vaccineBatchService: VaccineBatchService) {}

	@Post()
	@ApiResponse({ type: VaccineBatchDto })
	@ApiBody({ type: CreateVaccineBatchDto })
	async create(@Body() createVaccineBatchDto: CreateVaccineBatchDto) {
		return this.vaccineBatchService.create(createVaccineBatchDto);
	}

	@Get()
	@ApiPaginatedResponse(VaccineBatchDto)
	async findAll(@Query() query: VaccineBatchDto) {
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
