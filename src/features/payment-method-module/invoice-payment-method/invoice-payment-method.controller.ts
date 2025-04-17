import {
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
} from '@nestjs/common';
import { InvoicePaymentMethodService } from './payment-invoice-method.service';
import { CreateInvoicePaymentMethodDto } from './dto/create-invoce-payment-method';
import { UpdateInvoicePaymentMethodDto } from './dto/update-invoice-payment-method';
import { InvoicePaymentMethodDto } from './dto/invoice-payment-method.dto';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { Roles } from '@lib/decorators/auth/roles.decorators';
import { Role } from '@lib/constants/role.enum';
import { RolesGuard } from '@lib/guard/role.guard';
import { AppController } from '@lib/decorators/router/app-controller.decorator';
import { InvoicePaymentMethodQueryDto } from './dto/invoice-payment-method.query.dto';

@AppController({ name: 'invoice-payment-method', tag: 'Invoice Payment Method' })
@UseGuards(RolesGuard)
export class InvoicePaymentMethodController {
    constructor(
        private readonly invoicePaymentMethodService: InvoicePaymentMethodService,
    ) { }

    @Post()
    @Roles(Role.Admin)
    @ApiResponse({ type: InvoicePaymentMethodDto })
    @ApiBody({ type: CreateInvoicePaymentMethodDto })
    create(@Body() createDto: CreateInvoicePaymentMethodDto) {
        return this.invoicePaymentMethodService.create(createDto);
    }

    @Get('/')
	@Roles(Role.Employee, Role.Admin)
	@ApiResponse({ type: [InvoicePaymentMethodDto] })
	find(@Query() query: InvoicePaymentMethodQueryDto) {
		return this.invoicePaymentMethodService.find(query);
	}

    @Get(':id')
    @Roles(Role.Employee, Role.Admin)
    @ApiResponse({ type: InvoicePaymentMethodDto })
    findOne(@Param('id') id: string) {
        return this.invoicePaymentMethodService.findOne(+id);
    }

    @Patch(':id')
    @Roles(Role.Admin)
    @ApiResponse({ type: InvoicePaymentMethodDto })
    @ApiBody({ type: UpdateInvoicePaymentMethodDto })
    update(
        @Param('id') id: string,
        @Body() updateDto: UpdateInvoicePaymentMethodDto,
    ) {
        return this.invoicePaymentMethodService.update(+id, updateDto);
    }

    @Delete(':id')
    @Roles(Role.Admin)
    @ApiResponse({ status: 200, description: 'Eliminado correctamente' })
    remove(@Param('id') id: string) {
        return this.invoicePaymentMethodService.remove(+id);
    }
}
