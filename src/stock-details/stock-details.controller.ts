import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
} from '@nestjs/common';
import { StockDetailsService } from './stock-details.service';
import { CreateStockDetailDto } from './dto/create-stock-detail.dto';
import { UpdateStockDetailDto } from './dto/update-stock-detail.dto';

@Controller('stock-details')
export class StockDetailsController {
	constructor(private readonly stockDetailsService: StockDetailsService) {}

	@Post()
	create(@Body() createStockDetailDto: CreateStockDetailDto) {
		return this.stockDetailsService.create(createStockDetailDto);
	}

	@Get()
	findAll() {
		return this.stockDetailsService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.stockDetailsService.findOne(+id);
	}

	@Patch(':id')
	update(
		@Param('id') id: string,
		@Body() updateStockDetailDto: UpdateStockDetailDto,
	) {
		return this.stockDetailsService.update(+id, updateStockDetailDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.stockDetailsService.remove(+id);
	}
}
