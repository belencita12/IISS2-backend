import { VaccineManufacturerDto } from '@features/vaccine-module/vaccine-manufacturer/dto/vaccine-manufacturer.dto';
import { ApiProperty } from '@nestjs/swagger';

export class VaccineSummaryDto {
	@ApiProperty({ example: 1 })
	id: number;

	@ApiProperty({ example: 'Vacuna X' })
	name: string;

	@ApiProperty({ type: VaccineManufacturerDto })
	manufacturer: VaccineManufacturerDto;
}
