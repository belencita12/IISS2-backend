import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WorkShiftDto } from '../work-shift/work-shift.dto';
import { WorkPosition, WorkShift } from '@prisma/client';

interface PositionWithShifts extends WorkPosition {
	shifts: WorkShift[];
}

export class WorkPositionDto {
	constructor(data: PositionWithShifts) {
		this.id = data.id;
		this.name = data.name;
		this.shifts = data.shifts.map((s) => new WorkShiftDto(s));
		this.createdAt = data.createdAt;
		this.updatedAt = data.updatedAt;
		this.deletedAt = data.deletedAt;
	}

	@ApiProperty({ example: 1 })
	id: number;

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
