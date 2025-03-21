import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateVaccineBatchDto {
	@ApiPropertyOptional()
	@IsString()
	code: string;

	@ApiPropertyOptional()
	@IsNumber()
	manufacturerId: number;

	@ApiPropertyOptional()
	@IsNumber()
	vaccineId: number;
}
