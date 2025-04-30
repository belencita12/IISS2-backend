import { Get, Param, Delete, Query } from '@nestjs/common';
import { ProductCostService } from './product-cost.service';
import { ProductCostQueryDto } from './dto/product-cost-query.dto';
import { ApiResponse } from '@nestjs/swagger';
import { ProductCostDto } from './dto/product-cost.dto';
import { ApiPaginatedResponse } from '@lib/decorators/documentation/api-pagination-response.decorator';
import { IdValidationPipe } from '@lib/pipes/id-validation.pipe';
import { AdminOnly } from '@lib/decorators/auth/admin-only.decorator';
import { AppController } from '@lib/decorators/router/app-controller.decorator';

@AdminOnly()
@AppController({ name: 'product-cost', tag: 'Product Cost' })
export class ProductCostController {
	constructor(private readonly productCostService: ProductCostService) {}

	@Get()
	@ApiPaginatedResponse(ProductCostDto)
	async findAll(@Query() query: ProductCostQueryDto) {
		return await this.productCostService.findAll(query);
	}

	@Get(':id')
	@ApiResponse({ type: ProductCostDto })
	findOne(@Param('id', IdValidationPipe) id: number) {
		return this.productCostService.findOne(id);
	}

	@Delete(':id')
	remove(@Param('id', IdValidationPipe) id: number) {
		return this.productCostService.remove(id);
	}
}
