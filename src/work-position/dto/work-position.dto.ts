import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WorkShiftDto } from './work-shift.dto';
import { WorkPosition, WorkShift } from '@prisma/client';

interface PositionWithShifts extends WorkPosition {
	shifts: WorkShift[];
}

export class WorkPositionDto {
	constructor(partial: PositionWithShifts) {
		Object.assign(this, partial);
	}

	@ApiProperty({ example: 'Auxiliar' })
	name: string;

	@ApiProperty({ type: [WorkShiftDto] })
	shifts: WorkShiftDto[];

	@ApiProperty()
	createdAt: Date;

	@ApiProperty()
	updatedAt: Date;

	@ApiPropertyOptional()
	deletedAt: Date | null;
}
