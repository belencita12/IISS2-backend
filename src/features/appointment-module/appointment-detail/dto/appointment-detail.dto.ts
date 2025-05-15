import { ServiceTypeDto } from '@features/service-type/dto/service-type.dto';
import { ApiProperty } from '@nestjs/swagger';

export class AppointmentDetailDto {
	@ApiProperty()
	id: number;

	@ApiProperty({ type: ServiceTypeDto })
	service: ServiceTypeDto;

	@ApiProperty()
	appointmentId: number;

	@ApiProperty()
	startAt: Date;

	@ApiProperty()
	endAt: Date;

	@ApiProperty()
	partialDuration: number;
}
