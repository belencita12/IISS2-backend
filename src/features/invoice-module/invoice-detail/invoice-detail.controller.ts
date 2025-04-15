import { Get, Param, Query } from '@nestjs/common';
import { ApiPaginatedResponse } from '@lib/decorators/documentation/api-pagination-response.decorator';
import { ApiResponse } from '@nestjs/swagger';
import { InvoiceDetailService } from './invoice-detail.service';
import { InvoiceDetailQueryDto } from '../dto/invoice-detail-query.dto';
import { InvoiceDetailDto } from '../dto/invoice-detail.dto';
import { AppController } from '@lib/decorators/router/app-controller.decorator';

@AppController({ name: 'invoice-detail', tag: 'Invoice Detail' })
export class InvoiceDetailController {
	constructor(private readonly invoiceDetailService: InvoiceDetailService) {}
	@Get()
	@ApiPaginatedResponse(InvoiceDetailDto)
	findAllDetails(@Query() query: InvoiceDetailQueryDto) {
		return this.invoiceDetailService.findAll(query);
	}

	@Get(':id')
	@ApiResponse({ type: InvoiceDetailDto })
	findOneDetail(@Param('id') id: string) {
		return this.invoiceDetailService.findOne(+id);
	}
}
