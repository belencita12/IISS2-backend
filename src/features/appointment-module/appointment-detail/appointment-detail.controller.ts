import { AppController } from '@lib/decorators/router/app-controller.decorator';
import { AppointmentDetailDto } from './dto/appointment-detail.dto';
import { AppointmentDetailQueryDto } from './dto/appointment-detail-query.dto';
import { AppointmentDetailService } from './appointment-detail.service';
import { ProductCostDto } from '@features/product-module/product-cost/dto/product-cost.dto';
import { ApiPaginatedResponse } from '@lib/decorators/documentation/api-pagination-response.decorator';
import { IdValidationPipe } from '@lib/pipes/id-validation.pipe';
import { Get, Query, Param } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

@AppController({ name: 'appointment-detail', tag: 'Appointment Detail' })
export class AppointmentDetailController {
	constructor(
		private readonly appointmentDetailService: AppointmentDetailService,
	) {}

	@Get()
	@ApiPaginatedResponse(AppointmentDetailDto)
	async findAll(@Query() query: AppointmentDetailQueryDto) {
		return await this.appointmentDetailService.findAll(query);
	}

	@Get(':id')
	@ApiResponse({ type: ProductCostDto })
	findOne(@Param('id', IdValidationPipe) id: number) {
		return this.appointmentDetailService.findOne(id);
	}
}
