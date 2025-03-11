import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { CreateWorkShiftDto } from './create-work-shift.dto';

export class CreateWorkPositionDto {
	@IsString()
	@ApiProperty({ example: 'Auxiliar' })
	name: string;

	@ApiProperty({ type: [CreateWorkShiftDto] })
	shifts: CreateWorkShiftDto[];
}
