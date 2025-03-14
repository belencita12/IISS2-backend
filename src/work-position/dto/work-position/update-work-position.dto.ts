import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	ArrayMinSize,
	IsArray,
	IsString,
	ValidateNested,
} from 'class-validator';
import { UpdateWorkShiftDto } from '../work-shift/update-work-shift.dto';
import { Type } from 'class-transformer';

export class UpdateWorkPositionDto {
	@IsString()
	@ApiProperty({ example: 'Auxiliar' })
	name: string;

	@IsArray()
	@ValidateNested({ each: true })
	@ArrayMinSize(1, { message: 'Debe haber al menos un turno' })
	@Type(() => UpdateWorkShiftDto)
	@ApiPropertyOptional({ type: [UpdateWorkShiftDto] })
	shifts: UpdateWorkShiftDto[];
}
