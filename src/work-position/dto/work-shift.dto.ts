import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WorkShiftDto {
	@ApiProperty({ example: 1 })
	id: number;

	@ApiProperty({ example: 1 })
	workPositionId: number;

	@ApiProperty({ example: 1 })
	weekDay: number;

	@ApiProperty()
	startTime: Date;

	@ApiProperty()
	endTime: Date;

	@ApiProperty()
	createdAt: Date;

	@ApiProperty()
	updatedAt: Date;

	@ApiPropertyOptional()
	deletedAt: Date | null;
}
