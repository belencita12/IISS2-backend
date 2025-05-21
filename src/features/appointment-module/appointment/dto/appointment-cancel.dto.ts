import { IsStrLen } from '@lib/decorators/validation/is-str-len.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class AppointmentCancelDto {
	@ApiProperty()
	@IsStrLen(12, 512)
	description: string;
}
