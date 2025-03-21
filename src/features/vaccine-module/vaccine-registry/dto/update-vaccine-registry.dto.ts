import { PartialType } from '@nestjs/swagger';
import { CreateVaccineRegistryDto } from './create-vaccine-registry.dto';

export class UpdateVaccineRegistryDto extends PartialType(
	CreateVaccineRegistryDto,
) {}
