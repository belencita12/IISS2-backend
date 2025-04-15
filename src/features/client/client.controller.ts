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
import { ClientService } from './client.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ClientQueryDto } from './dto/client-query.dto';
import { ApiBody, ApiConsumes, ApiResponse } from '@nestjs/swagger';
import { ClientDto } from './dto/client.dto';
import { ApiPaginatedResponse } from '@lib/decorators/documentation/api-pagination-response.decorator';
import { IdValidationPipe } from '@lib/pipes/id-validation.pipe';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImgValidator } from '@lib/pipes/file-validator.pipe';
import { Role } from '@lib/constants/role.enum';
import { Roles } from '@lib/decorators/auth/roles.decorators';
import { RolesGuard } from '@lib/guard/role.guard';
import { AppController } from '@lib/decorators/router/app-controller.decorator';

@UseGuards(RolesGuard)
@AppController({ name: 'client', tag: 'Client' })
export class ClientController {
	constructor(private readonly clientService: ClientService) {}

	@Post()
	@Roles(Role.Admin)
	@ApiBody({ type: CreateClientDto })
	@ApiResponse({ type: ClientDto })
	create(@Body() createClientDto: CreateClientDto) {
		return this.clientService.create(createClientDto);
	}

	@Get()
	@Roles(Role.Admin)
	@ApiPaginatedResponse(ClientDto)
	findAll(@Query() query: ClientQueryDto) {
		return this.clientService.findAll(query);
	}

	@Get(':id')
	@Roles(Role.Admin)
	@ApiResponse({ type: ClientDto })
	findOne(@Param('id', IdValidationPipe) id: number) {
		return this.clientService.findOne(id);
	}

	@Patch(':id')
	@Roles(Role.Admin, Role.User)
	@ApiResponse({ type: ClientDto })
	@ApiBody({ type: UpdateClientDto })
	@ApiConsumes('multipart/form-data')
	@UseInterceptors(FileInterceptor('profileImg'))
	update(
		@Param('id', IdValidationPipe) id: number,
		@Body() dto: UpdateClientDto,
		@UploadedFile(ImgValidator) img?: Express.Multer.File,
	) {
		return this.clientService.update(id, { ...dto, profileImg: img });
	}

	@Delete(':id')
	@Roles(Role.Admin, Role.User)
	remove(@Param('id', IdValidationPipe) id: number) {
		return this.clientService.remove(id);
	}
}
