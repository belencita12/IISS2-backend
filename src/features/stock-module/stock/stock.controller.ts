import { Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { StockService } from './stock.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { StockDto } from './dto/stock.dto';
import { StockQueryDto } from './dto/stock-query.dto';
import { ApiPaginatedResponse } from '@lib/decorators/documentation/api-pagination-response.decorator';
import { AdminOnly } from '@lib/decorators/auth/admin-only.decorator';
import { AppController } from '@lib/decorators/router/app-controller.decorator';

@AdminOnly()
@AppController({ name: 'stock', tag: 'Stock' })
export class StockController {
	constructor(private readonly stockService: StockService) {}

	@Post()
	@ApiBody({ type: CreateStockDto })
	@ApiResponse({ type: StockDto })
	create(@Body() createStockDto: CreateStockDto) {
		return this.stockService.create(createStockDto);
	}

	@Get()
	@ApiPaginatedResponse(StockDto)
	findAll(@Query() query: StockQueryDto) {
		return this.stockService.findAll(query);
	}

	@Get(':id')
	@ApiResponse({ type: StockDto })
	findOne(@Param('id') id: string) {
		return this.stockService.findOne(+id);
	}

	@Patch(':id')
	@ApiBody({ type: UpdateStockDto })
	@ApiResponse({ type: StockDto })
	update(@Param('id') id: string, @Body() updateStockDto: UpdateStockDto) {
		return this.stockService.update(+id, updateStockDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.stockService.remove(+id);
	}
}
