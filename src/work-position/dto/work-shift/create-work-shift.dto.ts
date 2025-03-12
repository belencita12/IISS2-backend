import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Max, Min } from 'class-validator';

export class CreateWorkShiftDto {
	@IsInt()
	@Min(0)
	@Max(6)
	@ApiProperty({ example: 2 })
	weekDay: number;

	@IsString()
	@ApiProperty({ example: '08:00' })
	startTime: string;

	@IsString()
	@ApiProperty({ example: '12:00' })
	endTime: string;
}
