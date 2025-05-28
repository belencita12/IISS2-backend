import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentVaccineDto } from './appointment-vaccine.dto';
export class VaccineRegistryDto {
	@ApiProperty()
	id: number;

	@ApiProperty()
	petId: number;

	@ApiProperty()
	dose: number;

	@ApiPropertyOptional()
	applicationDate?: Date;

	@ApiProperty()
	expectedDate: Date;

	@ApiProperty({ type: () => AppointmentVaccineDto })
	vaccine: AppointmentVaccineDto;
}
