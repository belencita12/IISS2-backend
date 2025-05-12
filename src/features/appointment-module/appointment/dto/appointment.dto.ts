import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentStatus } from '@prisma/client';
import { AppointmentEmployeeDto } from './appointment-employee.dto';
import { AppointmentPetDto } from './appointment-pet.dto';

export class AppointmentDto {
	@ApiProperty()
	id: number;

	@ApiProperty()
	designatedDate: Date;

	@ApiPropertyOptional()
	completedDate?: Date;

	@ApiPropertyOptional()
	details?: string;

	@ApiProperty()
	service: string;

	@ApiProperty({ type: AppointmentPetDto })
	pet: AppointmentPetDto;

	@ApiProperty({ enum: AppointmentStatus })
	status: AppointmentStatus;

	@ApiProperty({ type: [AppointmentEmployeeDto] })
	employees: AppointmentEmployeeDto[];
}
