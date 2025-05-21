import { ApiPaginatedResponse } from '@lib/decorators/documentation/api-pagination-response.decorator';
import { AppController } from '@lib/decorators/router/app-controller.decorator';
import { Body, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { StampedDto } from './dto/stamped.dto';
import { StampedQueryDto } from './dto/stamped-query.dto';
import { StampedService } from './stamped.service';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { CreateStampedDto } from './dto/create-stamped.dto';
import { IdValidationPipe } from '@lib/pipes/id-validation.pipe';
import { AdminOnly } from '@lib/decorators/auth/admin-only.decorator';

@AdminOnly()
@AppController({ name: 'stamped', tag: 'Stamped' })
export class StampedController {
	constructor(private readonly stampedService: StampedService) {}

	@Post()
	@ApiResponse({ type: StampedDto })
	@ApiBody({ type: CreateStampedDto })
	create(@Body() dto: CreateStampedDto) {
		return this.stampedService.create(dto);
	}

	@Get()
	@ApiPaginatedResponse(StampedDto)
	findAll(@Query() query: StampedQueryDto) {
		return this.stampedService.findAll(query);
	}

	@Get(':id')
	@ApiResponse({ type: StampedDto })
	findOne(@Param('id', IdValidationPipe) id: number) {
		return this.stampedService.findOne(+id);
	}

	@Patch(':id')
	@ApiResponse({ type: StampedDto })
	@ApiBody({ type: CreateStampedDto })
	update(
		@Param('id', IdValidationPipe) id: number,
		@Body() dto: CreateStampedDto,
	) {
		return this.stampedService.update(id, dto);
	}

	@Delete(':id')
	remove(@Param('id', IdValidationPipe) id: number) {
		return this.stampedService.remove(+id);
	}
}
