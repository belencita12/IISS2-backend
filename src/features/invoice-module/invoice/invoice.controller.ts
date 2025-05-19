import {
	Get,
	Post,
	Body,
	Param,
	Delete,
	Query,
	UseGuards,
	Res,
} from '@nestjs/common';
import { Response } from 'express';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { InvoiceQueryDto } from '../dto/invoice-query.dto';
import { ApiPaginatedResponse } from '@lib/decorators/documentation/api-pagination-response.decorator';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { InvoiceDto } from '../dto/invoice.dto';
import { RolesGuard } from '@lib/guard/role.guard';
import { Roles } from '@lib/decorators/auth/roles.decorators';
import { Role } from '@lib/constants/role.enum';
import { AppController } from '@lib/decorators/router/app-controller.decorator';
import { InvoiceService } from './invoice.service';
import { PayCreditInvoiceDto } from '../dto/pay-credit-invoice.dto';
import { ApiPdfResponse } from '@lib/decorators/documentation/api-pdf-response.decorator';
import { CurrentUser } from '@lib/decorators/auth/current-user.decoratot';
import { TokenPayload } from '@features/auth-module/auth/types/auth.types';
import { InvoiceReportQueryDto } from '../dto/invoice-report-query.dto';
import { InvoiceReport } from './invoice.report';

@AppController({ name: 'invoice', tag: 'Invoice' })
@UseGuards(RolesGuard)
export class InvoiceController {
	constructor(
		private readonly invoiceService: InvoiceService,
		private readonly invoiceReport: InvoiceReport,
	) {}

	@Post()
	@ApiResponse({ type: InvoiceDto })
	@ApiBody({ type: CreateInvoiceDto })
	@Roles(Role.Employee, Role.Admin)
	create(@Body() createInvoiceDto: CreateInvoiceDto) {
		return this.invoiceService.create(createInvoiceDto);
	}

	@Get('/report')
	@ApiPdfResponse()
	@Roles(Role.Admin, Role.Employee)
	getReport(
		@Res() response: Response,
		@CurrentUser() user: TokenPayload,
		@Query() query: InvoiceReportQueryDto,
	) {
		return this.invoiceReport.getReport(query, user, response);
	}

	@Get('/')
	@ApiPaginatedResponse(InvoiceDto)
	@Roles(Role.Employee, Role.Admin)
	findAll(@Query() query: InvoiceQueryDto) {
		return this.invoiceService.findAll(query);
	}

	@Get('/:id')
	@ApiResponse({ type: InvoiceDto })
	@Roles(Role.Employee, Role.Admin)
	findOne(@Param('id') id: string) {
		return this.invoiceService.findOne(+id);
	}

	@Post('/pay/:id')
	@ApiResponse({ type: InvoiceDto })
	@ApiBody({ type: PayCreditInvoiceDto })
	@Roles(Role.Employee, Role.Admin)
	payCreditInvoice(@Param('id') id: string, @Body() dto: PayCreditInvoiceDto) {
		return this.invoiceService.payCreditInvoice(+id, dto);
	}

	@Delete(':id')
	@Roles(Role.Admin)
	remove(@Param('id') id: string) {
		return this.invoiceService.remove(+id);
	}
}
