import { ApiProperty } from '@nestjs/swagger';

export class AppointmentPetOwnerDto {
	@ApiProperty()
	id: number;

	@ApiProperty()
	name: string;
}
