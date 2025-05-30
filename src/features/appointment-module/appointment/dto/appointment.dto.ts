import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentStatus } from '@prisma/client';
import { AppointmentEmployeeDto } from './appointment-employee.dto';
import { AppointmentPetDto } from './appointment-pet.dto';
import { ServiceTypeSummaryDto } from '@features/service-type/dto/service-type-summary.dto';
import { VaccineRegistryDto } from './appointment-vaccine-registry.dto';

export class AppointmentDto {
	@ApiProperty()
	id: number;

	@ApiProperty()
	designatedDate: Date;

	@ApiPropertyOptional()
	completedDate?: Date;

	@ApiPropertyOptional()
	details?: string;

	@ApiProperty({ type: AppointmentPetDto })
	pet: AppointmentPetDto;

	@ApiProperty({ enum: AppointmentStatus })
	status: AppointmentStatus;

	@ApiProperty({ type: [ServiceTypeSummaryDto] })
	services: ServiceTypeSummaryDto[];

	@ApiProperty({ type: AppointmentEmployeeDto })
	employee: AppointmentEmployeeDto;

	@ApiPropertyOptional({ type: [VaccineRegistryDto] })
	vaccineRegistry?: VaccineRegistryDto[];
}
