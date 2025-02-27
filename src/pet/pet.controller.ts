import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	Query,
} from '@nestjs/common';
import { PetService } from './pet.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PetDto } from './dto/pet.dto';
import { PetQueryDto } from './dto/pet-query.dto';
import { ApiPaginatedResponse } from '@/lib/decorators/api-pagination-response.decorator';

@Controller('pet')
@ApiTags('Pet')
export class PetController {
	constructor(private readonly petService: PetService) {}

	@Post()
	@ApiResponse({ type: PetDto })
	@ApiBody({ type: CreatePetDto })
	async create(@Body() createPetDto: CreatePetDto) {
		return this.petService.create(createPetDto);
	}

	@Get()
	@ApiPaginatedResponse(PetDto)
	async findAll(@Query() query: PetQueryDto) {
		return this.petService.findAll(query);
	}

	@Get(':id')
	@ApiResponse({ type: PetDto })
	async findOne(@Param('id') id: string) {
		return this.petService.findOne(+id);
	}

	@Patch(':id')
	@ApiResponse({ type: PetDto })
	async update(@Param('id') id: string, @Body() updatePetDto: UpdatePetDto) {
		return this.petService.update(+id, updatePetDto);
	}

	@Delete(':id')
	@ApiResponse({ type: PetDto })
	async remove(@Param('id') id: string) {
		return this.petService.remove(+id);
	}
}
