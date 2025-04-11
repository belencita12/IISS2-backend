import {
	Get,
	Post,
	Body,
	Param,
	Delete,
	Query,
	UseGuards,
} from '@nestjs/common';
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

@AppController({ name: 'invoice', tag: 'Invoice' })
@UseGuards(RolesGuard)
export class InvoiceController {
	constructor(private readonly invoiceService: InvoiceService) {}

	@Post()
	@ApiResponse({ type: InvoiceDto })
	@ApiBody({ type: CreateInvoiceDto })
	@Roles(Role.Employee, Role.Admin)
	create(@Body() createInvoiceDto: CreateInvoiceDto) {
		return this.invoiceService.create(createInvoiceDto);
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

	@Delete(':id')
	@Roles(Role.Admin)
	remove(@Param('id') id: string) {
		this.invoiceService.remove(+id);
	}
}
