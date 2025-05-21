import {
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	Query,
	UseInterceptors,
	UploadedFile,
	UseGuards,
} from '@nestjs/common';
import { ServiceTypeService } from './service-type.service';
import { CreateServiceTypeDto } from './dto/create-service-type.dto';
import { AppController } from '@lib/decorators/router/app-controller.decorator';
import { ServiceTypeQueryDto } from './dto/service-type-query.dto';
import { ApiPaginatedResponse } from '@lib/decorators/documentation/api-pagination-response.decorator';
import { ServiceTypeDto } from './dto/service-type.dto';
import { ApiBody, ApiConsumes, ApiResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImgValidator } from '@lib/pipes/file-validator.pipe';
import { RolesGuard } from '@lib/guard/role.guard';
import { Roles } from '@lib/decorators/auth/roles.decorators';
import { Role } from '@lib/constants/role.enum';

@AppController({ name: 'service-type', tag: 'Service Type' })
@UseGuards(RolesGuard)
export class ServiceTypeController {
	constructor(private readonly serviceTypeService: ServiceTypeService) {}

	@Post()
	@Roles(Role.Admin, Role.Employee)
	@ApiConsumes('multipart/form-data')
	@UseInterceptors(FileInterceptor('img'))
	@ApiResponse({ type: ServiceTypeDto })
	@ApiBody({ type: CreateServiceTypeDto })
	create(
		@Body() dto: CreateServiceTypeDto,
		@UploadedFile(ImgValidator) img?: Express.Multer.File,
	) {
		dto.img = img;
		return this.serviceTypeService.create(dto);
	}

	@Get()
	@ApiPaginatedResponse(ServiceTypeDto)
	findAll(@Query() query: ServiceTypeQueryDto) {
		return this.serviceTypeService.findAll(query);
	}

	@Get(':id')
	@ApiResponse({ type: ServiceTypeDto })
	findOne(@Param('id') id: string) {
		return this.serviceTypeService.findOne(+id);
	}

	@Patch(':id')
	@Roles(Role.Admin, Role.Employee)
	@ApiConsumes('multipart/form-data')
	@UseInterceptors(FileInterceptor('img'))
	@ApiResponse({ type: ServiceTypeDto })
	@ApiBody({ type: CreateServiceTypeDto })
	update(
		@Param('id') id: string,
		@Body() dto: CreateServiceTypeDto,
		@UploadedFile(ImgValidator) img?: Express.Multer.File,
	) {
		dto.img = img;
		return this.serviceTypeService.update(+id, dto);
	}

	@Delete(':id')
	@Roles(Role.Admin)
	remove(@Param('id') id: string) {
		return this.serviceTypeService.remove(+id);
	}
}
