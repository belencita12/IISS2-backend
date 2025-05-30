import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional } from 'class-validator';

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
	@IsOptional()
	appointmentId?: number;

	@ApiPropertyOptional()
	@IsOptional()
	@IsDateString()
	applicationDate?: Date;

	@ApiPropertyOptional()
	@IsDateString()
	expectedDate: Date;
}
