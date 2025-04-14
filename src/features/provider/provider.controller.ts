import { Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProviderService } from './provider.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { ProviderQueryDto } from './dto/provider-query.dto';
import { ProviderDto } from './dto/provider.dto';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { ApiPaginatedResponse } from '@lib/decorators/documentation/api-pagination-response.decorator';
import { IdValidationPipe } from '@lib/pipes/id-validation.pipe';
import { AdminOnly } from '@lib/decorators/auth/admin-only.decorator';
import { AppController } from '@lib/decorators/router/app-controller.decorator';

@AdminOnly()
@AppController({ name: 'provider', tag: 'Provider' })
export class ProviderController {
	constructor(private readonly providerService: ProviderService) {}

	@Post()
	@ApiResponse({
		type: ProviderDto,
		description: 'Proveedor creado correctamente',
	})
	@ApiBody({ type: CreateProviderDto })
	create(@Body() dto: CreateProviderDto) {
		return this.providerService.create(dto);
	}

	@Get()
	@ApiPaginatedResponse(ProviderDto)
	findAll(@Query() query: ProviderQueryDto) {
		return this.providerService.findAll(query);
	}

	@Get(':id')
	@ApiResponse({ type: ProviderDto })
	findOne(@Param('id', IdValidationPipe) id: number) {
		return this.providerService.findOne(id);
	}

	@Patch(':id')
	@ApiResponse({
		type: ProviderDto,
		description: 'Proveedor actualizado correctamente',
	})
	@ApiBody({ type: UpdateProviderDto })
	update(
		@Param('id', IdValidationPipe) id: number,
		@Body() dto: UpdateProviderDto,
	) {
		return this.providerService.update(id, dto);
	}

	@Delete(':id')
	@ApiResponse({ description: 'Proveedor eliminado correctamente' })
	remove(@Param('id', IdValidationPipe) id: number) {
		return this.providerService.remove(id);
	}
}
