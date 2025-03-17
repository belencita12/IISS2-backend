import {
	Controller,
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
import {
	ApiBearerAuth,
	ApiBody,
	ApiConsumes,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from '@/lib/guard/role.guard';
import { Role } from '@/lib/constants/role.enum';
import { Roles } from '@/lib/decorators/roles.decorators';
import { VaccineDto } from './dto/vaccine.dto';
import { ApiPaginatedResponse } from '@/lib/decorators/api-pagination-response.decorator';
import { VaccineQueryDto } from './dto/vaccine-query.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileValidator } from '@/lib/pipes/file-validator.pipe';

@ApiBearerAuth('access-token')
@ApiTags('vaccine')
@Controller('vaccine')
export class VaccineController {
	constructor(private readonly vaccineService: VaccineService) {}

	@UseGuards(RolesGuard)
	@Roles(Role.Admin)
	@Post()
	@ApiConsumes('multipart/form-data')
	@UseInterceptors(FileInterceptor('productImg'))
	@ApiResponse({ type: VaccineDto })
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				speciesId: { type: 'number' },
				name: { type: 'string' },
				manufacturerId: { type: 'number' },
				cost: { type: 'number' },
				iva: { type: 'number' },
				price: { type: 'number' },
				productImg: { type: 'string', format: 'binary' },
			},
		},
	})
	async create(
		@Body() body: any,
		@UploadedFile(FileValidator) img?: Express.Multer.File,
	) {
		const createVaccineDto: CreateVaccineDto = {
			speciesId: Number(body.speciesId),
			name: body.name,
			manufacturerId: Number(body.manufacturerId),
			productData: {
				name: body.name,
				cost: Number(body.cost),
				category: body.category,
				iva: Number(body.iva),
				price: Number(body.price),
				productImg: img,
			},
		};

		return this.vaccineService.create(createVaccineDto);
	}

	@UseGuards(RolesGuard)
	@Roles(Role.Admin, Role.User)
	@Get()
	@ApiPaginatedResponse(VaccineQueryDto)
	findAll(@Query() query: VaccineQueryDto) {
		return this.vaccineService.findAll(query);
	}

	@UseGuards(RolesGuard)
	@Roles(Role.Admin, Role.User)
	@Get(':id')
	@ApiResponse({ type: VaccineDto })
	findOne(@Param('id') id: string) {
		return this.vaccineService.findOne(+id);
	}

	@UseGuards(RolesGuard)
	@Roles(Role.Admin)
	@Patch(':id')
	@ApiConsumes('multipart/form-data')
	@UseInterceptors(FileInterceptor('productImg'))
	@ApiResponse({ type: VaccineDto })
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				speciesId: { type: 'number' },
				name: { type: 'string' },
				manufacturerId: { type: 'number' },
				cost: { type: 'number' },
				iva: { type: 'number' },
				price: { type: 'number' },
				productImg: { type: 'string', format: 'binary' },
			},
		},
	})
	async update(
		@Param('id') id: string,
		@Body() body: any,
		@UploadedFile(FileValidator) img?: Express.Multer.File,
	) {
		const updateVaccineDto: UpdateVaccineDto = {
			speciesId: body.speciesId ? Number(body.speciesId) : undefined,
			name: body.name,
			manufacturerId: body.manufacturerId
				? Number(body.manufacturerId)
				: undefined,
			productData: {
				name: body.name,
				cost: body.cost !== undefined ? Number(body.cost) : 0,
				category: body.category,
				iva: body.iva !== undefined ? Number(body.iva) : 0.1,
				price: body.price !== undefined ? Number(body.price) : 0,
				productImg: img,
			},
		};

		return this.vaccineService.update(+id, updateVaccineDto);
	}

	@UseGuards(RolesGuard)
	@Roles(Role.Admin)
	@Delete(':id')
	@ApiResponse({ type: VaccineDto })
	remove(@Param('id') id: string) {
		return this.vaccineService.remove(+id);
	}
}
