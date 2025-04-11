import { Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { TagService } from './tag.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagDto } from './dto/tag.dto';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { IdValidationPipe } from '@lib/pipes/id-validation.pipe';
import { ApiPaginatedResponse } from '@lib/decorators/documentation/api-pagination-response.decorator';
import { TagQueryDto } from './dto/tag-query.dto';
import { AppController } from '@lib/decorators/router/app-controller.decorator';
import { AdminOnly } from '@lib/decorators/auth/admin-only.decorator';

@AppController({ name: 'tag', tag: 'Tag' })
@AdminOnly()
export class TagController {
	constructor(private readonly tagService: TagService) {}

	@Post()
	@ApiResponse({ type: TagDto, description: 'Etiqueta creada correctamente' })
	@ApiBody({ type: CreateTagDto })
	create(@Body() dto: CreateTagDto) {
		return this.tagService.create(dto);
	}

	@Get()
	@ApiPaginatedResponse(TagDto)
	findAll(@Query() query: TagQueryDto) {
		return this.tagService.findAll(query);
	}

	@Get(':id')
	@ApiResponse({ type: TagDto })
	findOne(@Param('id', IdValidationPipe) id: number) {
		return this.tagService.findOne(id);
	}

	@Patch(':id')
	@ApiResponse({
		type: TagDto,
		description: 'Etiqueta actualizada correctamente',
	})
	@ApiBody({ type: UpdateTagDto })
	update(@Param('id', IdValidationPipe) id: number, @Body() dto: UpdateTagDto) {
		return this.tagService.update(id, dto);
	}

	@Delete(':id')
	@ApiResponse({ description: 'Etiqueta eliminada correctamente' })
	remove(@Param('id', IdValidationPipe) id: number) {
		return this.tagService.remove(id);
	}
}
