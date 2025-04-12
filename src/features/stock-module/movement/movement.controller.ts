import {
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
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateMovementDto } from './dto/movement/create-movement.dto';
import { MovementDto } from './dto/movement/movement.dto';
import { MovementQueryDto } from './dto/movement/movement-query.dto';
import { Role } from '@lib/constants/role.enum';
import { ApiPaginatedResponse } from '@lib/decorators/documentation/api-pagination-response.decorator';
import { Roles } from '@lib/decorators/auth/roles.decorators';
import { RolesGuard } from '@lib/guard/role.guard';
import { AppController } from '@lib/decorators/router/app-controller.decorator';

@AppController({ name: 'movement', tag: 'Movement' })
@UseGuards(RolesGuard)
@Roles(Role.Admin, Role.Employee)
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
