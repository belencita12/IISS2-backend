import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	Delete,
	UseGuards,
	Query,
	ParseIntPipe,
} from '@nestjs/common';
import { MovementService } from './movement.service';
import {
	ApiBearerAuth,
	ApiBody,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { CreateMovementDto } from './dto/movement/create-movement.dto';
import { MovementDto } from './dto/movement/movement.dto';
import { MovementQueryDto } from './dto/movement/movement-query.dto';
import { Role } from '@lib/constants/role.enum';
import { ApiPaginatedResponse } from '@lib/decorators/api-pagination-response.decorator';
import { Roles } from '@lib/decorators/roles.decorators';
import { RolesGuard } from '@lib/guard/role.guard';

@Controller('movement')
@ApiTags('movement')
@ApiBearerAuth('access-token')
@UseGuards(RolesGuard)
@Roles(Role.Admin)
export class MovementController {
	constructor(private readonly movementService: MovementService) {}

	@Post()
	@ApiBody({ type: CreateMovementDto })
	@ApiResponse({ type: MovementDto })
	create(@Body() createMovementDto: CreateMovementDto) {
		return this.movementService.create(createMovementDto);
	}

	@Get()
	@ApiPaginatedResponse(MovementDto)
	findAll(@Query() query: MovementQueryDto) {
		return this.movementService.findAll(query);
	}

	@Get(':id')
	@ApiResponse({ type: MovementDto })
	findOne(@Param('id') id: string) {
		return this.movementService.findOne(+id);
	}

	@Post(':id/revert')
	@ApiOperation({
		summary: 'Revertir un movimiento creando un movimiento inverso',
	})
	@ApiResponse({ status: 201, description: 'Movimiento revertido creado' })
	async revertMovement(@Param('id', ParseIntPipe) id: number) {
		return this.movementService.revertMovement(id);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.movementService.remove(+id);
	}
}
