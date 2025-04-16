import {
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PaymentMethodService } from './payment-method.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { RolesGuard } from '@lib/guard/role.guard';
import { Roles } from '@lib/decorators/auth/roles.decorators';
import { Role } from '@lib/constants/role.enum';
import { AppController } from '@lib/decorators/router/app-controller.decorator';
import { PaymentMethodDto } from './dto/payment-method.dto';

@AppController({ name: 'payment-method', tag: 'Payment Method' })
@UseGuards(RolesGuard)
export class PaymentMethodController {
  constructor(private readonly paymentMethodService: PaymentMethodService) {}

  @Post()
  @Roles(Role.Admin)
  @ApiResponse({ type: PaymentMethodDto })
  @ApiBody({ type: CreatePaymentMethodDto })
  create(@Body() createPaymentMethodDto: CreatePaymentMethodDto) {
    return this.paymentMethodService.create(createPaymentMethodDto);
  }

  @Get()
  @Roles(Role.Employee, Role.Admin)
  @ApiResponse({ type: [PaymentMethodDto] })
  findAll() {
    return this.paymentMethodService.findAll();
  }

  @Get(':id')
  @Roles(Role.Employee, Role.Admin)
  @ApiResponse({ type: PaymentMethodDto })
  findOne(@Param('id') id: string) {
    return this.paymentMethodService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.Admin)
  @ApiResponse({ type: PaymentMethodDto })
  @ApiBody({ type: UpdatePaymentMethodDto })
  update(@Param('id') id: string, @Body() updatePaymentMethodDto: UpdatePaymentMethodDto) {
    return this.paymentMethodService.update(+id, updatePaymentMethodDto);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  @ApiResponse({ status: 200, description: 'Soft-deleted successfully' })
  remove(@Param('id') id: string) {
    return this.paymentMethodService.remove(+id);
  }
}
