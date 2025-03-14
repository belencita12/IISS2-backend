import {
	Controller,
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
import { UpdateEmplyeeDto } from './dto/update-employee.dto';
import { EmployeeQueryDto } from './dto/employee.query.dto';
import {
	ApiBearerAuth,
	ApiBody,
	ApiConsumes,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from '@/lib/guard/role.guard';
import { Roles } from '@/lib/decorators/roles.decorators';
import { Role } from '@/lib/constants/role.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileValidator } from '@/lib/pipes/file-validator.pipe';
import { EmployeeDto } from './dto/employee.dto';
import { ApiPaginatedResponse } from '@/lib/decorators/api-pagination-response.decorator';
import { IdValidationPipe } from '@/lib/pipes/id-validation.pipe';

@Controller('employee')
@ApiTags('Employee')
@ApiBearerAuth('access-token')
@UseGuards(RolesGuard)
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
		@UploadedFile(FileValidator) img?: Express.Multer.File,
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
		@Body() dto: UpdateEmplyeeDto,
		@UploadedFile(FileValidator) img?: Express.Multer.File,
	) {
		return this.emplyeeService.update(id, { ...dto, profileImg: img });
	}

	@Delete(':id')
	@Roles(Role.Admin)
	remove(@Param('id', IdValidationPipe) id: number) {
		return this.emplyeeService.remove(id);
	}
}
