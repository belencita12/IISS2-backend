import { PartialType } from '@nestjs/swagger';
import { CreateVaccineManufacturerDto } from './create-vaccine-manufacturer.dto';

export class UpdateVaccineManufacturerDto extends PartialType(
	CreateVaccineManufacturerDto,
) {}
