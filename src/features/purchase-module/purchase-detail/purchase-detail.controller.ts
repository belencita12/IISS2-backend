import { Get, Param, Query } from '@nestjs/common';
import { PurchaseDetailService } from './purchase-detail.service';
import { ApiResponse } from '@nestjs/swagger';
import { PurchaseDetailDto } from './dto/purchase-detail.dto';
import { PurchaseDetailQueryDto } from './dto/purchase-detail-query.dto';
import { ApiPaginatedResponse } from '@lib/decorators/documentation/api-pagination-response.decorator';
import { AdminOnly } from '@lib/decorators/auth/admin-only.decorator';
import { AppController } from '@lib/decorators/router/app-controller.decorator';

@AdminOnly()
@AppController({ name: 'purchase-detail', tag: 'Purchase Detail' })
export class PurchaseDetailController {
	constructor(private readonly purchaseDetailService: PurchaseDetailService) {}
	@Get()
	@ApiPaginatedResponse(PurchaseDetailDto)
	findAll(@Query() query: PurchaseDetailQueryDto) {
		return this.purchaseDetailService.findAll(query);
	}

	@Get(':id')
	@ApiResponse({ type: PurchaseDetailDto })
	findOne(@Param('id') id: string) {
		return this.purchaseDetailService.findOne(+id);
	}
}
