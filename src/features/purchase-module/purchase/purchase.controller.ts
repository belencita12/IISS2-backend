import { Get, Post, Body, Param, Query } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { PurchaseDto } from './dto/purchase.dto';
import { ApiPaginatedResponse } from '@lib/decorators/documentation/api-pagination-response.decorator';
import { PurchaseQueryDto } from './dto/purchase-query.dto';
import { AdminOnly } from '@lib/decorators/auth/admin-only.decorator';
import { AppController } from '@lib/decorators/router/app-controller.decorator';

@AdminOnly()
@AppController({ name: 'purchase', tag: 'Purchase' })
export class PurchaseController {
	constructor(private readonly purchaseService: PurchaseService) {}

	@Post()
	@ApiBody({ type: CreatePurchaseDto })
	@ApiResponse({ type: PurchaseDto })
	create(@Body() createPurchaseDto: CreatePurchaseDto) {
		return this.purchaseService.create(createPurchaseDto);
	}

	@Get()
	@ApiPaginatedResponse(PurchaseDto)
	findAll(@Query() query: PurchaseQueryDto) {
		return this.purchaseService.findAll(query);
	}

	@Get(':id')
	@ApiResponse({ type: PurchaseDto })
	findOne(@Param('id') id: string) {
		return this.purchaseService.findOne(+id);
	}
}
