import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateVaccineManufacturerDto {
	@ApiPropertyOptional()
	@IsString()
	name: string;
}
