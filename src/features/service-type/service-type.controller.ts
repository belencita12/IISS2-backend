import { Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ServiceTypeService } from './service-type.service';
import { CreateServiceTypeDto } from './dto/create-service-type.dto';
import { UpdateServiceTypeDto } from './dto/update-service-type.dto';
import { AppController } from '@lib/decorators/router/app-controller.decorator';
import { AdminOnly } from '@lib/decorators/auth/admin-only.decorator';

@AppController({ name: 'service-type', tag: 'Service Type' })
@AdminOnly()
export class ServiceTypeController {
	constructor(private readonly serviceTypeService: ServiceTypeService) {}

	@Post()
	create(@Body() createServiceTypeDto: CreateServiceTypeDto) {
		return this.serviceTypeService.create(createServiceTypeDto);
	}

	@Get()
	findAll() {
		return this.serviceTypeService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.serviceTypeService.findOne(+id);
	}

	@Patch(':id')
	update(
		@Param('id') id: string,
		@Body() updateServiceTypeDto: UpdateServiceTypeDto,
	) {
		return this.serviceTypeService.update(+id, updateServiceTypeDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.serviceTypeService.remove(+id);
	}
}
