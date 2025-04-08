import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsDateString, IsOptional } from 'class-validator';

export class VaccineBatchDto {
	@ApiPropertyOptional()
	id: number;

	@ApiPropertyOptional()
	code: string;

	@ApiPropertyOptional()
	manufacturerId: number;

	@ApiPropertyOptional()
	vaccineId: number;

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

	constructor(partial: Partial<VaccineBatchDto>) {
		Object.assign(this, partial);
	}
}
