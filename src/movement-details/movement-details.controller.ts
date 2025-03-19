import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
} from '@nestjs/common';
import { MovementDetailsService } from './movement-details.service';
import { CreateMovementDetailDto } from './dto/create-movement-detail.dto';
import { UpdateMovementDetailDto } from './dto/update-movement-detail.dto';

@Controller('movement-details')
export class MovementDetailsController {
	constructor(
		private readonly movementDetailsService: MovementDetailsService,
	) {}

	@Post()
	create(@Body() createMovementDetailDto: CreateMovementDetailDto) {
		return this.movementDetailsService.create(createMovementDetailDto);
	}

	@Get()
	findAll() {
		return this.movementDetailsService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.movementDetailsService.findOne(+id);
	}

	@Patch(':id')
	update(
		@Param('id') id: string,
		@Body() updateMovementDetailDto: UpdateMovementDetailDto,
	) {
		return this.movementDetailsService.update(+id, updateMovementDetailDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.movementDetailsService.remove(+id);
	}
}
