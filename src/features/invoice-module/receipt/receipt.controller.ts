import { Role } from '@lib/constants/role.enum';
import { Roles } from '@lib/decorators/auth/roles.decorators';
import { AppController } from '@lib/decorators/router/app-controller.decorator';
import { RolesGuard } from '@lib/guard/role.guard';
import { Get, Param, Query, UseGuards } from '@nestjs/common';
import { ReceiptQueryDto } from './dto/receipt-query.dto';
import { ReceiptService } from './receipt.service';
import { ApiPaginatedResponse } from '@lib/decorators/documentation/api-pagination-response.decorator';
import { ReceiptDto } from './dto/receipt.dto';

@AppController({ name: 'receipt', tag: 'Receipt' })
@UseGuards(RolesGuard)
@Roles(Role.Admin, Role.Employee)
export class ReceiptController {
	constructor(private readonly receiptService: ReceiptService) {}

	@Get()
	@ApiPaginatedResponse(ReceiptDto)
	findAll(@Query() query: ReceiptQueryDto) {
		return this.receiptService.findAll(query);
	}

	@Get(':id')
	@ApiPaginatedResponse(ReceiptDto)
	findOne(@Param() id: string) {
		return this.receiptService.findOne(+id);
	}
}
