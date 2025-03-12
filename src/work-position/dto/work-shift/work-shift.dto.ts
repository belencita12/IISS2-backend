import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WorkShift } from '@prisma/client';

export class WorkShiftDto {
	constructor(data: WorkShift) {
		this.id = data.id;
		this.weekDay = data.weekDay;
		this.startTime = data.startTime;
		this.endTime = data.endTime;
		this.createdAt = data.createdAt;
		this.updatedAt = data.updatedAt;
		this.deletedAt = data.deletedAt;
	}

	@ApiProperty({ example: 1 })
	id: number;

	@ApiProperty({ example: 1 })
	weekDay: number;

	@ApiProperty({ example: '08:00' })
	startTime: string;

	@ApiProperty({ example: '12:00' })
	endTime: string;

	@ApiProperty()
	createdAt: Date;

	@ApiProperty()
	updatedAt: Date;

	@ApiPropertyOptional()
	deletedAt: Date | null;
}
