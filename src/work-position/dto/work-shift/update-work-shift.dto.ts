import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsPositive } from 'class-validator';
import { CreateWorkShiftDto } from './create-work-shift.dto';

export class UpdateWorkShiftDto extends CreateWorkShiftDto {
	@IsInt()
	@IsOptional()
	@IsPositive()
	@ApiPropertyOptional({ example: 1 })
	id?: number;
}
