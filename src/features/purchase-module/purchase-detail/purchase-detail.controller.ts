import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import { PurchaseDetailService } from './purchase-detail.service';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '@lib/guard/role.guard';
import { Roles } from '@lib/decorators/roles.decorators';
import { Role } from '@lib/constants/role.enum';
import { PurchaseDetailDto } from './dto/purchase-detail.dto';
import { PurchaseDetailQueryDto } from './dto/purchase-detail-query.dto';
import { ApiPaginatedResponse } from '@lib/decorators/api-pagination-response.decorator';

@Controller('purchase-detail')
@ApiTags('purchase-detail')
@ApiBearerAuth('access-token')
@UseGuards(RolesGuard)
@Roles(Role.Admin)
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
