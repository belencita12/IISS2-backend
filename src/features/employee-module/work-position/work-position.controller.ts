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
import { WorkPositionService } from './work-position.service';
import { CreateWorkPositionDto } from './dto/work-position/create-work-position.dto';
import { UpdateWorkPositionDto } from './dto/work-position/update-work-position.dto';
import { WorkPositionQueryDto } from './dto/work-position/work-position-query.dto';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WorkPositionDto } from './dto/work-position/work-position.dto';
import { Role } from '@lib/constants/role.enum';
import { ApiPaginatedResponse } from '@lib/decorators/api-pagination-response.decorator';
import { Roles } from '@lib/decorators/roles.decorators';
import { RolesGuard } from '@lib/guard/role.guard';

@Controller('work-position')
@ApiTags('WorkPosition')
@ApiBearerAuth('access-token')
@UseGuards(RolesGuard)
@Roles(Role.Admin)
export class WorkPositionController {
	constructor(private readonly workPositionService: WorkPositionService) {}

	@Post()
	@ApiBody({ type: CreateWorkPositionDto })
	@ApiResponse({ type: WorkPositionDto })
	create(@Body() dto: CreateWorkPositionDto) {
		return this.workPositionService.create(dto);
	}

	@Get()
	@ApiPaginatedResponse(WorkPositionDto)
	findAll(@Query() query: WorkPositionQueryDto) {
		return this.workPositionService.findAll(query);
	}

	@Get(':id')
	@ApiResponse({ type: WorkPositionDto })
	findOne(@Param('id') id: string) {
		return this.workPositionService.findOne(+id);
	}

	@Patch(':id')
	@ApiBody({ type: UpdateWorkPositionDto })
	@ApiResponse({ type: WorkPositionDto })
	update(@Param('id') id: string, @Body() dto: UpdateWorkPositionDto) {
		return this.workPositionService.update(+id, dto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.workPositionService.remove(+id);
	}
}
