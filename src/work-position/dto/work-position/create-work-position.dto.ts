import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, ValidateNested } from 'class-validator';
import { CreateWorkShiftDto } from '../work-shift/create-work-shift.dto';
import { Type } from 'class-transformer';

export class CreateWorkPositionDto {
	@IsString()
	@ApiProperty({ example: 'Auxiliar' })
	name: string;

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => CreateWorkShiftDto)
	@ApiProperty({ type: [CreateWorkShiftDto] })
	shifts: CreateWorkShiftDto[];
}
