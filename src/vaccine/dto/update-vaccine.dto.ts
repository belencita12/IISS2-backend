import { PartialType } from '@nestjs/swagger';
import { CreateVaccineDto } from './create-vaccine.dto';
import { IsOptional } from 'class-validator';

export class UpdateVaccineDto extends PartialType(CreateVaccineDto) {
	@IsOptional()
	productData?: CreateVaccineDto['productData'];
}
