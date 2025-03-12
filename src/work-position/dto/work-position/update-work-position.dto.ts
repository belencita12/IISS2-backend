import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, ValidateNested } from 'class-validator';
import { UpdateWorkShiftDto } from '../work-shift/update-work-shift.dto';
import { Type } from 'class-transformer';

export class UpdateWorkPositionDto {
	@IsString()
	@ApiProperty({ example: 'Auxiliar' })
	name: string;

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => UpdateWorkShiftDto)
	@ApiProperty({ type: [UpdateWorkShiftDto] })
	shifts: UpdateWorkShiftDto[];
}
