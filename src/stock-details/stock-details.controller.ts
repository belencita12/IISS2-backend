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
import { StockDetailsService } from './stock-details.service';
import { CreateStockDetailsDto } from './dto/create-stock-detail.dto';
import { UpdateStockDetailsDto } from './dto/update-stock-detail.dto';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/lib/decorators/roles.decorators';
import { RolesGuard } from '@/lib/guard/role.guard';
import { Role } from '@/lib/constants/role.enum';
import { StockDetailsDto } from './dto/stock-details.dto';
import { ApiPaginatedResponse } from '@/lib/decorators/api-pagination-response.decorator';
import { StockDetailsQueryDto } from './dto/stock-details-query.dto';

@Controller('stock-details')
@ApiTags('stock-details')
@ApiBearerAuth('access-token')
@UseGuards(RolesGuard)
@Roles(Role.Admin)
export class StockDetailsController {
	constructor(private readonly stockDetailsService: StockDetailsService) {}

	@Post()
	@ApiBody({ type: CreateStockDetailsDto })
	@ApiResponse({ type: StockDetailsDto })
	create(@Body() createStockDetailsDto: CreateStockDetailsDto) {
		return this.stockDetailsService.create(createStockDetailsDto);
	}

	@Get()
	@ApiPaginatedResponse(StockDetailsDto)
	findAll(@Query() query: StockDetailsQueryDto) {
		return this.stockDetailsService.findAll(query);
	}

	@Get(':id')
	@ApiResponse({ type: StockDetailsDto })
	findOne(@Param('id') id: string) {
		return this.stockDetailsService.findOne(+id);
	}

	@Patch(':id')
	@ApiBody({ type: UpdateStockDetailsDto })
	@ApiResponse({ type: StockDetailsDto })
	update(
		@Param('id') id: string,
		@Body() updateStockDetailsDto: UpdateStockDetailsDto,
	) {
		return this.stockDetailsService.update(+id, updateStockDetailsDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.stockDetailsService.remove(+id);
	}
}
