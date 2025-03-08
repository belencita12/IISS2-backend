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
	Request,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common';
import { Request as Req } from 'express';
import { PetService } from './pet.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import {
	ApiBearerAuth,
	ApiBody,
	ApiConsumes,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { PetDto } from './dto/pet.dto';
import { PetQueryDto } from './dto/pet-query.dto';
import { ApiPaginatedResponse } from '@/lib/decorators/api-pagination-response.decorator';
import { Roles } from '@/lib/decorators/roles.decorators';
import { Role } from '@/lib/constants/role.enum';
import { AuthGuard } from '@/auth/guard/auth.guard';
import { TokenPayload } from '@/auth/types/auth.types';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileValidator } from '@/lib/pipes/file-validator.pipe';

@UseGuards(AuthGuard)
@ApiTags('Pet')
@Controller('pet')
@ApiBearerAuth('access-token')
export class PetController {
	constructor(private readonly petService: PetService) {}

	@Post()
	@Roles(Role.Admin, Role.User)
	@ApiResponse({ type: PetDto })
	@ApiConsumes('multipart/form-data')
	@UseInterceptors(FileInterceptor('profileImg'))
	@ApiBody({ type: CreatePetDto })
	create(
		@Body() createPetDto: CreatePetDto,
		@UploadedFile(FileValidator) img?: Express.Multer.File,
	) {
		return this.petService.create({ ...createPetDto, profileImg: img });
	}

	@Get()
	@Roles(Role.Admin, Role.User)
	@ApiPaginatedResponse(PetDto)
	async findAll(@Query() query: PetQueryDto) {
		return this.petService.findAll(query);
	}

	@Get(':id')
	@Roles(Role.Admin, Role.User)
	@ApiResponse({ type: PetDto })
	async findOne(@Param('id') id: string, @Request() req: Req) {
		const payload: TokenPayload = req['user'];
		return this.petService.findOne(+id, payload);
	}

	@Patch(':id')
	@ApiConsumes('multipart/form-data')
	@UseInterceptors(FileInterceptor('profileImg'))
	@Roles(Role.Admin, Role.User)
	@ApiBody({ type: UpdatePetDto })
	@ApiResponse({ type: PetDto })
	async update(
		@Param('id') id: string,
		@Body() updatePetDto: UpdatePetDto,
		@UploadedFile(FileValidator) img?: Express.Multer.File,
	) {
		return this.petService.update(+id, { ...updatePetDto, profileImg: img });
	}

	@Delete(':id')
	@Roles(Role.Admin)
	@ApiResponse({ type: PetDto })
	async remove(@Param('id') id: string) {
		return this.petService.remove(+id);
	}
}
