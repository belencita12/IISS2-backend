import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { MovementDetailService } from './movement-detail.service';
import { IdValidationPipe } from '@lib/pipes/id-validation.pipe';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Role } from '@lib/constants/role.enum';
import { Roles } from '@lib/decorators/roles.decorators';
import { RolesGuard } from '@lib/guard/role.guard';
import { MovementDetailQueryDto } from './dto/movement-detail-query.dto';
import { ApiPaginatedResponse } from '@lib/decorators/api-pagination-response.decorator';
import { MovementDetailDto } from './dto/movement-detail.dto';

@Controller('movement-detail')
@ApiBearerAuth('access-token')
@UseGuards(RolesGuard)
@Roles(Role.Admin, Role.Employee)
export class MovementDetailController {
	constructor(private readonly movementDetailService: MovementDetailService) {}

	@Get()
	@ApiPaginatedResponse(MovementDetailDto)
	findAll(@Query() query: MovementDetailQueryDto) {
		return this.movementDetailService.findAll(query);
	}

	@Get(':id')
	@ApiResponse({ type: MovementDetailDto })
	findOne(@Param('id', IdValidationPipe) id: number) {
		return this.movementDetailService.findOne(id);
	}
}
