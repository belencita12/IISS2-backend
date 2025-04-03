import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	UseGuards,
	Query,
} from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '@lib/guard/role.guard';
import { Roles } from '@lib/decorators/roles.decorators';
import { Role } from '@lib/constants/role.enum';
import { PurchaseDto } from './dto/purchase.dto';
import { ApiPaginatedResponse } from '@lib/decorators/api-pagination-response.decorator';
import { PurchaseQueryDto } from './dto/purchase-query.dto';

@Controller('purchase')
@ApiTags('purchase')
@ApiBearerAuth('access-token')
@UseGuards(RolesGuard)
@Roles(Role.Admin)
export class PurchaseController {
	constructor(private readonly purchaseService: PurchaseService) {}

	@Post()
	@ApiBody({ type: CreatePurchaseDto })
	@ApiResponse({ type: PurchaseDto })
	create(@Body() createPurchaseDto: CreatePurchaseDto) {
		return this.purchaseService.create(createPurchaseDto);
	}

	@Get()
	@ApiPaginatedResponse(PurchaseDto)
	findAll(@Query() query: PurchaseQueryDto) {
		return this.purchaseService.findAll(query);
	}

	@Get(':id')
	@ApiResponse({ type: PurchaseDto })
	findOne(@Param('id') id: string) {
		return this.purchaseService.findOne(+id);
	}
}
