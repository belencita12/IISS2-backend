import { ApiProperty } from '@nestjs/swagger';

export class AppointmentEmployeeDto {
	@ApiProperty()
	id: number;

	@ApiProperty()
	name: string;
}
