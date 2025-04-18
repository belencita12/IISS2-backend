import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AvailabilityDateQueryDto {
	@ApiProperty()
	@IsString()
	date: string;
}
