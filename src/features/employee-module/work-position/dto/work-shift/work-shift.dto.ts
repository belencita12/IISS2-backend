import { IsTimeFormat } from '@lib/decorators/validation/is-time-format';
import { IsWeekDay } from '@lib/decorators/validation/is-week-day';
import { ApiProperty } from '@nestjs/swagger';
import { WorkShift } from '@prisma/client';

export class WorkShiftDto {
	constructor(data: WorkShift) {
		this.id = data.id;
		this.weekDay = data.weekDay;
		this.startTime = data.startTime;
		this.endTime = data.endTime;
	}

	@ApiProperty({ example: 1 })
	id: number;

	@IsWeekDay()
	@ApiProperty({ example: 1 })
	weekDay: number;

	@ApiProperty({ example: '08:00' })
	@IsTimeFormat()
	startTime: string;

	@ApiProperty({ example: '12:00' })
	@IsTimeFormat()
	endTime: string;
}
