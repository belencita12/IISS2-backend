import { IsTimeFormat } from '@lib/decorators/validation/is-time-format';
import { IsWeekDay } from '@lib/decorators/validation/is-week-day';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWorkShiftDto {
	@IsWeekDay()
	@ApiProperty({ example: 2 })
	weekDay: number;

	@IsTimeFormat()
	@ApiProperty({ example: '08:00' })
	startTime: string;

	@IsTimeFormat()
	@ApiProperty({ example: '12:00' })
	endTime: string;
}
