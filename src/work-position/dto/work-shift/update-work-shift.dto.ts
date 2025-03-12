import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';
import { CreateWorkShiftDto } from './create-work-shift.dto';

export class UpdateWorkShiftDto extends CreateWorkShiftDto {
	@IsInt()
	@ApiProperty({ example: 1 })
	id: number;
}
