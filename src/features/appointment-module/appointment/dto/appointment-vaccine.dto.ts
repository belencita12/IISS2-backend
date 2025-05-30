import { ApiProperty } from '@nestjs/swagger';

export class AppointmentVaccineDto {
	@ApiProperty()
	id: number;

	@ApiProperty()
	name: string;
}
