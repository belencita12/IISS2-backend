import {
	Get,
	Post,
	Body,
	Param,
	Delete,
	Query,
	Patch,
	UseGuards,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { AppController } from '@lib/decorators/router/app-controller.decorator';
import { CurrentUser } from '@lib/decorators/auth/current-user.decoratot';
import { TokenPayload } from '@features/auth-module/auth/types/auth.types';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { AppointmentDto } from './dto/appointment.dto';
import { SlotDto } from './dto/slot.dto';
import { AvailabilityDateQueryDto } from './dto/availability-date-query.dto';
import { AppointmentQueryDto } from './dto/appointment-query.dto';
import { ApiPaginatedResponse } from '@lib/decorators/documentation/api-pagination-response.decorator';
import { RolesGuard } from '@lib/guard/role.guard';
import { Roles } from '@lib/decorators/auth/roles.decorators';
import { Role } from '@lib/constants/role.enum';
import { AppointmentCancelDto } from './dto/appointment-cancel.dto';

@AppController({ name: 'appointment', tag: 'Appointment' })
@UseGuards(RolesGuard)
export class AppointmentController {
	constructor(private readonly appointmentService: AppointmentService) {}

	@Post()
	@ApiBody({ type: CreateAppointmentDto })
	@ApiResponse({ type: AppointmentDto })
	create(@Body() dto: CreateAppointmentDto, @CurrentUser() user: TokenPayload) {
		return this.appointmentService.create(dto, user);
	}

	@Get()
	@ApiPaginatedResponse(AppointmentDto)
	findAll(@Query() query: AppointmentQueryDto) {
		return this.appointmentService.findAll(query);
	}

	@Get(':id')
	@ApiResponse({ type: AppointmentDto })
	findOne(@Param('id') id: string) {
		return this.appointmentService.findOne(+id);
	}

	@Get('/availability/:id')
	@ApiResponse({ type: [SlotDto] })
	getSchedule(
		@Param('id') id: string,
		@Query() query: AvailabilityDateQueryDto,
	) {
		return this.appointmentService.getScheduleByEmployee(+id, query.date);
	}

	@Patch('/cancel/:id')
	@Roles(Role.Admin, Role.Employee)
	cancelAppointment(
		@Param('id') id: string,
		@Body() dto: AppointmentCancelDto,
		@CurrentUser() user: TokenPayload,
	) {
		return this.appointmentService.cancelAppointment(+id, dto, user);
	}

	@Patch('/complete/:id')
	@Roles(Role.Admin, Role.Employee)
	completeAppointment(@Param('id') id: string) {
		return this.appointmentService.completeAppointment(+id);
	}

	@Delete(':id')
	@Roles(Role.Admin, Role.Employee)
	remove(@Param('id') id: string) {
		return this.appointmentService.remove(+id);
	}
}
