import { Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProductPriceService } from './product-price.service';
import { CreateProductPriceDto } from './dto/create-product-price.dto';
import { ProductPriceQueryDto } from './dto/product-price-query.dto';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { ProductPriceDto } from './dto/product-price.dto';
import { ApiPaginatedResponse } from '@lib/decorators/documentation/api-pagination-response.decorator';
import { IdValidationPipe } from '@lib/pipes/id-validation.pipe';
import { AdminOnly } from '@lib/decorators/auth/admin-only.decorator';
import { AppController } from '@lib/decorators/router/app-controller.decorator';

@AdminOnly()
@AppController({ name: 'product-price', tag: 'Product Price' })
export class ProductPriceController {
	constructor(private readonly productPriceService: ProductPriceService) {}

	@Post()
	@ApiResponse({ type: ProductPriceDto })
	@ApiBody({ type: CreateProductPriceDto })
	async create(@Body() dto: CreateProductPriceDto) {
		return await this.productPriceService.create(dto);
	}

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

	@Patch(':id')
	@ApiBody({ type: CreateProductPriceDto })
	@ApiResponse({ type: ProductPriceDto })
	update(
		@Param('id', IdValidationPipe) id: number,
		@Body() dto: CreateProductPriceDto,
	) {
		return this.productPriceService.update(id, dto);
	}

	@Delete(':id')
	remove(@Param('id', IdValidationPipe) id: number) {
		return this.productPriceService.remove(id);
	}
}
