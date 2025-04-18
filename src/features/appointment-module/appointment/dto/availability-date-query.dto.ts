import { IsDbDate } from '@lib/decorators/validation/is-db-date.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class AvailabilityDateQueryDto {
	@ApiProperty()
	@IsDbDate()
	date: string;
}
