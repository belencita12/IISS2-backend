import { CreateAppointmentDetailDto } from '@features/appointment-module/appointment-detail/dto/create-appointment-detail.dto';
import { IsDbDate } from '@lib/decorators/validation/is-db-date.decorator';
import { IsId } from '@lib/decorators/validation/is-id.decorator';
import { IsTimeFormat } from '@lib/decorators/validation/is-time-format';
import { NoDuplicatesBy } from '@lib/decorators/validation/no-duplicated-by.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMinSize, IsOptional, IsString } from 'class-validator';

export class CreateAppointmentDto {
	@ApiProperty()
	@IsId()
	petId: number;

	@ApiProperty({ example: '2025-04-12' })
	@IsDbDate()
	designatedDate: string;

	@ApiProperty({ example: '09:05' })
	@IsTimeFormat()
	designatedTime: string;

	@IsOptional()
	@IsString()
	@ApiPropertyOptional()
	details?: string;

	@ApiProperty({ type: [CreateAppointmentDetailDto] })
	@NoDuplicatesBy<CreateAppointmentDetailDto>('serviceId', {
		message: 'No puede repertirse los identificadores de empleados',
	})
	@ArrayMinSize(1, { message: 'La cita debe contener al menos un servicio' })
	appointmentDetails: CreateAppointmentDetailDto[];
}
