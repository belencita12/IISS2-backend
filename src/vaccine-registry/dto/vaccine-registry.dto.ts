import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsDateString, IsOptional } from 'class-validator';

export class VaccineRegistryDto {
	@ApiPropertyOptional()
	id: number;

	@ApiPropertyOptional()
	name: string;

	@ApiPropertyOptional()
	vaccineId: number;

	@ApiPropertyOptional()
	petId: number;

	@ApiPropertyOptional()
	dose: number;

	@ApiPropertyOptional()
	applicationDate: Date;

	@ApiPropertyOptional()
	expectedDate: Date;

	@Expose()
	@IsDateString()
	@ApiProperty()
	createdAt: Date;

	@Expose()
	@IsDateString()
	@ApiProperty()
	updatedAt: Date;

	@Expose()
	@IsOptional()
	@IsDateString()
	@ApiPropertyOptional()
	deletedAt: Date | null;

	constructor(partial: Partial<VaccineRegistryDto>) {
		Object.assign(this, partial);
	}
}
