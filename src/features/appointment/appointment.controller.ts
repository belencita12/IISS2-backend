import { Get, Post, Body, Param, Delete } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { AppController } from '@lib/decorators/router/app-controller.decorator';
import { CurrentUser } from '@lib/decorators/auth/current-user.decoratot';
import { TokenPayload } from '@features/auth-module/auth/types/auth.types';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { AppointmentDto } from './dto/appointment.dto';

@AppController({ name: 'appointment', tag: 'Appointment' })
export class AppointmentController {
	constructor(private readonly appointmentService: AppointmentService) {}

	@Post()
	@ApiBody({ type: CreateAppointmentDto })
	@ApiResponse({ type: AppointmentDto })
	create(@Body() dto: CreateAppointmentDto, @CurrentUser() user: TokenPayload) {
		return this.appointmentService.create(dto, user);
	}

	@Get()
	findAll() {
		return this.appointmentService.findAll();
	}

	@Get(':id')
	@ApiResponse({ type: AppointmentDto })
	findOne(@Param('id') id: string) {
		return this.appointmentService.findOne(+id);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.appointmentService.remove(+id);
	}
}
