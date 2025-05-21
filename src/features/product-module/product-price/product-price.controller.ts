import { Get, Param, Delete, Query } from '@nestjs/common';
import { ProductPriceService } from './product-price.service';
import { ProductPriceQueryDto } from './dto/product-price-query.dto';
import { ApiResponse } from '@nestjs/swagger';
import { ProductPriceDto } from './dto/product-price.dto';
import { ApiPaginatedResponse } from '@lib/decorators/documentation/api-pagination-response.decorator';
import { IdValidationPipe } from '@lib/pipes/id-validation.pipe';
import { AdminOnly } from '@lib/decorators/auth/admin-only.decorator';
import { AppController } from '@lib/decorators/router/app-controller.decorator';

@AdminOnly()
@AppController({ name: 'product-price', tag: 'Product Price' })
export class ProductPriceController {
	constructor(private readonly productPriceService: ProductPriceService) {}

	@Get()
	@ApiPaginatedResponse(ProductPriceDto)
	async findAll(@Query() query: ProductPriceQueryDto) {
		return await this.productPriceService.findAll(query);
	}

	@Get(':id')
	@ApiResponse({ type: ProductPriceDto })
	findOne(@Param('id', IdValidationPipe) id: number) {
		return this.productPriceService.findOne(id);
	}

	@Delete(':id')
	remove(@Param('id', IdValidationPipe) id: number) {
		return this.productPriceService.remove(id);
	}
}
