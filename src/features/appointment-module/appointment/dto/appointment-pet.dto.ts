import { ApiProperty } from '@nestjs/swagger';
import { AppointmentPetOwnerDto } from './appointment-pet-owner.dto';

export class AppointmentPetDto {
	@ApiProperty()
	id: number;

	@ApiProperty()
	name: string;

	@ApiProperty()
	race: string;

	@ApiProperty({ type: AppointmentPetOwnerDto })
	owner: AppointmentPetOwnerDto;
}
