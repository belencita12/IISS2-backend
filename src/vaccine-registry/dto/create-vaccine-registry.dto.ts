import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateVaccineRegistryDto {
	@ApiPropertyOptional()
	@IsString()
	name: string;

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
	applicationDate: Date;

	@ApiPropertyOptional()
	expectedDate: Date;
}
