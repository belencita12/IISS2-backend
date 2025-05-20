import { Get, Post, Body, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { PurchaseService } from './purchase.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { PurchaseDto } from './dto/purchase.dto';
import { ApiPaginatedResponse } from '@lib/decorators/documentation/api-pagination-response.decorator';
import { PurchaseQueryDto } from './dto/purchase-query.dto';
import { AdminOnly } from '@lib/decorators/auth/admin-only.decorator';
import { AppController } from '@lib/decorators/router/app-controller.decorator';
import { PurchaseReport } from './purchase.report';
import { PurchaseReportQueryDto } from './dto/purchase-report-query.dto';
import { TokenPayload } from '@features/auth-module/auth/types/auth.types';
import { CurrentUser } from '@lib/decorators/auth/current-user.decoratot';
import { ApiPdfResponse } from '@lib/decorators/documentation/api-pdf-response.decorator';

@AdminOnly()
@AppController({ name: 'purchase', tag: 'Purchase' })
export class PurchaseController {
	constructor(
		private readonly purchaseService: PurchaseService,
		private readonly purchaseReport: PurchaseReport,
	) {}

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
	@Get('/report')
	@ApiPdfResponse()
	getReport(
		@Res() res: Response,
		@CurrentUser() user: TokenPayload,
		@Query() query: PurchaseReportQueryDto,
	) {
		return this.purchaseReport.getReport(query, user, res);
	}

	@Get(':id')
	@ApiResponse({ type: PurchaseDto })
	findOne(@Param('id') id: string) {
		return this.purchaseService.findOne(+id);
	}
}
