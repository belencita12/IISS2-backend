import { PartialType } from '@nestjs/swagger';
import { CreateVaccineBatchDto } from './create-vaccine-batch.dto';

export class UpdateVaccineBatchDto extends PartialType(CreateVaccineBatchDto) {}
