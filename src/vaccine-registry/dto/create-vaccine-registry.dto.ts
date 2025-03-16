import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber } from 'class-validator';

export class CreateVaccineRegistryDto {
	@ApiPropertyOptional()
	@IsNumber()
	vaccineId: number;

	@ApiPropertyOptional()
	@IsNumber()
	petId: number;

	@ApiPropertyOptional()
	@IsNumber()
	dose: number;

	@ApiPropertyOptional()
	@IsDateString()
	applicationDate: Date;

	@ApiPropertyOptional()
	@IsDateString()
	expectedDate: Date;
}
