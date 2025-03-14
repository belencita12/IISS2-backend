import { PaginationQueryDto } from '@/lib/commons/pagination-params.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class VaccineRegistryQueryDto extends PaginationQueryDto {
	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	name: string;

	@ApiPropertyOptional()
	@Type(() => Number)
	@IsInt()
	vaccineId: number;

	@ApiPropertyOptional()
	@Type(() => Number)
	@IsInt()
	petId: number;

	@ApiPropertyOptional()
	@IsNumber()
	dose: number;

	@ApiPropertyOptional()
	applicationDate: Date;

	@ApiPropertyOptional()
	expectedDate: Date;
}
