import {
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	Query,
	UseGuards,
	UseInterceptors,
	UploadedFile,
} from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { EmployeeQueryDto } from './dto/employee.query.dto';
import { ApiBody, ApiConsumes, ApiResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { EmployeeDto } from './dto/employee.dto';
import { Role } from '@lib/constants/role.enum';
import { ApiPaginatedResponse } from '@lib/decorators/documentation/api-pagination-response.decorator';
import { Roles } from '@lib/decorators/auth/roles.decorators';
import { RolesGuard } from '@lib/guard/role.guard';
import { IdValidationPipe } from '@lib/pipes/id-validation.pipe';
import { ImgValidator } from '@lib/pipes/file-validator.pipe';
import { AppController } from '@lib/decorators/router/app-controller.decorator';

@UseGuards(RolesGuard)
@AppController({ name: 'employee', tag: 'Employee' })
export class EmployeeController {
	constructor(private readonly emplyeeService: EmployeeService) {}

	@Post()
	@ApiConsumes('multipart/form-data')
	@UseInterceptors(FileInterceptor('profileImg'))
	@ApiBody({ type: CreateEmployeeDto })
	@ApiResponse({ type: EmployeeDto })
	@Roles(Role.Admin)
	create(
		@Body() dto: CreateEmployeeDto,
		@UploadedFile(ImgValidator) img?: Express.Multer.File,
	) {
		return this.emplyeeService.create({ ...dto, profileImg: img });
	}

	@Get()
	@ApiPaginatedResponse(EmployeeDto)
	@Roles(Role.Admin, Role.User)
	findAll(@Query() query: EmployeeQueryDto) {
		return this.emplyeeService.findAll(query);
	}

	@Get(':id')
	@ApiResponse({ type: EmployeeDto })
	@Roles(Role.Admin)
	findOne(@Param('id', IdValidationPipe) id: number) {
		return this.emplyeeService.findOne(id);
	}

	@Patch(':id')
	@ApiConsumes('multipart/form-data')
	@UseInterceptors(FileInterceptor('profileImg'))
	@ApiBody({ type: CreateEmployeeDto })
	@ApiResponse({ type: EmployeeDto })
	@Roles(Role.Admin)
	update(
		@Param('id', IdValidationPipe) id: number,
		@Body() dto: CreateEmployeeDto,
		@UploadedFile(ImgValidator) img?: Express.Multer.File,
	) {
		return this.emplyeeService.update(id, { ...dto, profileImg: img });
	}

	@Delete(':id')
	@Roles(Role.Admin)
	remove(@Param('id', IdValidationPipe) id: number) {
		return this.emplyeeService.remove(id);
	}
}
