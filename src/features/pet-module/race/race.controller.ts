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
import { RaceService } from './race.service';
import { CreateRaceDto } from './dto/create-race.dto';
import { UpdateRaceDto } from './dto/update-race.dto';
import { ApiTags, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { RaceQueryDto } from './dto/race-query.dto';
import { RaceDto } from './dto/race.dto';
import { Role } from '@lib/constants/role.enum';
import { ApiPaginatedResponse } from '@lib/decorators/api-pagination-response.decorator';
import { Roles } from '@lib/decorators/roles.decorators';
import { RolesGuard } from '@lib/guard/role.guard';

@ApiTags('Race')
@Controller('race')
@ApiBearerAuth('access-token')
export class RaceController {
	constructor(private readonly raceService: RaceService) {}

	@UseGuards(RolesGuard)
	@Roles(Role.Admin)
	@Post()
	@ApiResponse({ type: RaceDto })
	@ApiBody({ type: CreateRaceDto })
	async create(@Body() createRaceDto: CreateRaceDto) {
		return this.raceService.create(createRaceDto);
	}

	@UseGuards(RolesGuard)
	@Roles(Role.User, Role.Admin)
	@Get()
	@ApiPaginatedResponse(RaceDto)
	async findAll(@Query() query: RaceQueryDto) {
		return this.raceService.findAll(query);
	}

	@UseGuards(RolesGuard)
	@Roles(Role.User, Role.Admin)
	@Get(':id')
	@ApiResponse({ type: RaceDto })
	async findOne(@Param('id') id: string) {
		return this.raceService.findOne(+id);
	}

	@UseGuards(RolesGuard)
	@Roles(Role.User, Role.Admin)
	@Patch(':id')
	@ApiResponse({ type: RaceDto })
	async update(@Param('id') id: string, @Body() updateRaceDto: UpdateRaceDto) {
		return this.raceService.update(+id, updateRaceDto);
	}

	@UseGuards(RolesGuard)
	@Roles(Role.Admin)
	@Delete(':id')
	@ApiResponse({ type: RaceDto })
	async remove(@Param('id') id: string) {
		return this.raceService.remove(+id);
	}
}
