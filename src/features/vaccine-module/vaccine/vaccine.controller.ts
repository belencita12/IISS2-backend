import {
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseGuards,
	Query,
	UseInterceptors,
	UploadedFile,
} from '@nestjs/common';
import { VaccineService } from './vaccine.service';
import { CreateVaccineDto } from './dto/create-vaccine.dto';
import { UpdateVaccineDto } from './dto/update-vaccine.dto';
import { ApiConsumes, ApiResponse } from '@nestjs/swagger';
import { VaccineDto } from './dto/vaccine.dto';
import { VaccineQueryDto } from './dto/vaccine-query.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from '@lib/constants/role.enum';
import { ApiPaginatedResponse } from '@lib/decorators/documentation/api-pagination-response.decorator';
import { Roles } from '@lib/decorators/auth/roles.decorators';
import { RolesGuard } from '@lib/guard/role.guard';
import { ImgValidator } from '@lib/pipes/file-validator.pipe';
import { AppController } from '@lib/decorators/router/app-controller.decorator';

@AppController({ name: 'vaccine', tag: 'Vaccine' })
@UseGuards(RolesGuard)
export class VaccineController {
	constructor(private readonly vaccineService: VaccineService) {}

	@Roles(Role.Admin)
	@Post()
	@ApiConsumes('multipart/form-data')
	@UseInterceptors(FileInterceptor('productImg'))
	@ApiResponse({ type: VaccineDto })
	async create(
		@Body() createVaccineDto: CreateVaccineDto,
		@UploadedFile(ImgValidator) img?: Express.Multer.File,
	) {
		createVaccineDto.productImg = img;
		return this.vaccineService.create(createVaccineDto);
	}

	@Roles(Role.Admin, Role.User)
	@Get()
	@ApiPaginatedResponse(VaccineQueryDto)
	findAll(@Query() query: VaccineQueryDto) {
		return this.vaccineService.findAll(query);
	}

	@Roles(Role.Admin, Role.User)
	@Get(':id')
	@ApiResponse({ type: VaccineDto })
	findOne(@Param('id') id: string) {
		return this.vaccineService.findOne(+id);
	}

	@Roles(Role.Admin)
	@Patch(':id')
	@ApiConsumes('multipart/form-data')
	@UseInterceptors(FileInterceptor('productImg'))
	@ApiResponse({ type: VaccineDto })
	async update(
		@Param('id') id: string,
		@Body() updateVaccineDto: UpdateVaccineDto,
		@UploadedFile(ImgValidator) img?: Express.Multer.File,
	) {
		updateVaccineDto.productImg = img;
		return this.vaccineService.update(+id, updateVaccineDto);
	}

	@Roles(Role.Admin)
	@Delete(':id')
	@ApiResponse({ type: VaccineDto })
	remove(@Param('id') id: string) {
		return this.vaccineService.remove(+id);
	}
}
