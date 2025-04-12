import {
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
import { ApiBody, ApiConsumes, ApiResponse } from '@nestjs/swagger';
import { PetDto } from './dto/pet.dto';
import { PetQueryDto } from './dto/pet-query.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdatePetDto } from './dto/update-pet.dto';
import { AuthGuard } from '@features/auth-module/auth/guard/auth.guard';
import { TokenPayload } from '@features/auth-module/auth/types/auth.types';
import { Role } from '@lib/constants/role.enum';
import { ApiPaginatedResponse } from '@lib/decorators/documentation/api-pagination-response.decorator';
import { Roles } from '@lib/decorators/auth/roles.decorators';
import { ImgValidator } from '@lib/pipes/file-validator.pipe';
import { IsOwnerGuard } from '@lib/guard/is-owner.guard';
import { Resource } from '@lib/decorators/resource.decorator';
import { CurrentUser } from '@lib/decorators/auth/current-user.decoratot';
import { AppController } from '@lib/decorators/router/app-controller.decorator';

@UseGuards(AuthGuard)
@AppController({ name: 'pet', tag: 'Pet' })
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
		@UploadedFile(ImgValidator) img?: Express.Multer.File,
	) {
		return this.petService.create({ ...createPetDto, profileImg: img });
	}

	@Get()
	@Roles(Role.Admin, Role.User)
	@ApiPaginatedResponse(PetDto)
	async findAll(
		@Query() query: PetQueryDto,
		@CurrentUser() user: TokenPayload,
	) {
		if (user && user.clientId) {
			query.clientId = user.clientId;
		}
		return this.petService.findAll(query);
	}

	@Get(':id')
	@UseGuards(IsOwnerGuard)
	@Resource('pet')
	@Roles(Role.Admin, Role.User)
	@ApiResponse({ type: PetDto })
	async findOne(@Param('id') id: string, @Request() req: Req) {
		const payload: TokenPayload = req['user'];
		return this.petService.findOne(+id, payload);
	}

	@Patch(':id')
	@UseGuards(IsOwnerGuard)
	@Resource('pet')
	@ApiConsumes('multipart/form-data')
	@UseInterceptors(FileInterceptor('profileImg'))
	@Roles(Role.Admin, Role.User)
	@ApiBody({ type: UpdatePetDto })
	@ApiResponse({ type: PetDto })
	async update(
		@Param('id') id: string,
		@Body() updatePetDto: UpdatePetDto,
		@UploadedFile(ImgValidator) img?: Express.Multer.File,
	) {
		return this.petService.update(+id, { ...updatePetDto, profileImg: img });
	}

	@Delete(':id')
	@UseGuards(IsOwnerGuard)
	@Resource('pet')
	@Roles(Role.Admin, Role.User)
	@ApiResponse({ type: PetDto })
	async remove(@Param('id') id: string) {
		return this.petService.remove(+id);
	}
}
