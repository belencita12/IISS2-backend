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
				'productData[name]': { type: 'string' },
				'productData[cost]': { type: 'number' },
				'productData[category]': { type: 'string' },
				'productData[iva]': { type: 'number' },
				'productData[price]': { type: 'number' },
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
				name: body['productData[name]'],
				cost: Number(body['productData[cost]']) || 0,
				category: body['productData[category]'],
				iva: Number(body['productData[iva]']) || 0.1,
				price: Number(body['productData[price]']) || 0,
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
	@ApiResponse({ type: VaccineDto })
	update(@Param('id') id: string, @Body() updateVaccineDto: UpdateVaccineDto) {
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
