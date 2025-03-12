import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
} from '@nestjs/common';
import { EmplyeeService } from './emplyee.service';
import { CreateEmplyeeDto } from './dto/create-emplyee.dto';
import { UpdateEmplyeeDto } from './dto/update-emplyee.dto';

@Controller('emplyee')
export class EmplyeeController {
	constructor(private readonly emplyeeService: EmplyeeService) {}

	@Post()
	create(@Body() createEmplyeeDto: CreateEmplyeeDto) {
		return this.emplyeeService.create(createEmplyeeDto);
	}

	@Get()
	findAll() {
		return this.emplyeeService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.emplyeeService.findOne(+id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateEmplyeeDto: UpdateEmplyeeDto) {
		return this.emplyeeService.update(+id, updateEmplyeeDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.emplyeeService.remove(+id);
	}
}
