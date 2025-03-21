import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsDateString, IsOptional } from 'class-validator';

export class VaccineRegistryDto {
	@ApiProperty()
	id: number;

	@ApiProperty()
	vaccineId: number;

	@ApiProperty()
	petId: number;

	@ApiProperty()
	dose: number;

	@ApiProperty()
	applicationDate: Date;

	@ApiProperty()
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
