import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { UpdateWorkShiftDto } from './update-work-shift.dto';

export class UpdateWorkPositionDto {
	@IsString()
	@ApiProperty({ example: 'Auxiliar' })
	name: string;

	@ApiProperty({ type: [UpdateWorkShiftDto] })
	shifts: UpdateWorkShiftDto[];
}
