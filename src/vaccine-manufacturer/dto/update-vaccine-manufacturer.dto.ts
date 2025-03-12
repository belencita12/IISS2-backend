import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateVaccineManufacturerDto } from './create-vaccine-manufacturer.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateVaccineManufacturerDto extends PartialType(
	CreateVaccineManufacturerDto,
) {
	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	name?: string;
}
