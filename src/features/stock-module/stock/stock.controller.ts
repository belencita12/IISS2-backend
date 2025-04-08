import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseGuards,
	Query,
} from '@nestjs/common';
import { StockService } from './stock.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StockDto } from './dto/stock.dto';
import { StockQueryDto } from './dto/stock-query.dto';
import { Role } from '@lib/constants/role.enum';
import { ApiPaginatedResponse } from '@lib/decorators/api-pagination-response.decorator';
import { Roles } from '@lib/decorators/roles.decorators';
import { RolesGuard } from '@lib/guard/role.guard';

@Controller('stock')
@ApiTags('stock')
@ApiBearerAuth('access-token')
@UseGuards(RolesGuard)
@Roles(Role.Admin)
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
