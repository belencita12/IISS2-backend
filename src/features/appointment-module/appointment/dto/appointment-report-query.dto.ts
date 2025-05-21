import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class AppointmentReportQueryDto {
	@ApiProperty({
		example: '2025-01-01',
	})
	@IsDateString()
	from: string;

	@ApiProperty({ example: '2025-12-31' })
	@IsDateString()
	to: string;
}
