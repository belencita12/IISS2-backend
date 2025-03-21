import { ApiProperty } from '@nestjs/swagger';
import {
	ArrayMinSize,
	IsArray,
	IsString,
	ValidateNested,
} from 'class-validator';
import { CreateWorkShiftDto } from '../work-shift/create-work-shift.dto';
import { Type } from 'class-transformer';

export class CreateWorkPositionDto {
	@IsString()
	@ApiProperty({ example: 'Auxiliar' })
	name: string;

	@IsArray()
	@ValidateNested({ each: true })
	@ArrayMinSize(1, { message: 'Debe haber al menos un turno' })
	@Type(() => CreateWorkShiftDto)
	@ApiProperty({ type: [CreateWorkShiftDto] })
	shifts: CreateWorkShiftDto[];
}
