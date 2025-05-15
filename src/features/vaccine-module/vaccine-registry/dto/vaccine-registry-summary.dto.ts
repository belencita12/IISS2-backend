import { VaccineSummaryDto } from '@features/vaccine-module/vaccine/dto/vaccine-summary.dto';
import { ApiProperty } from '@nestjs/swagger';

export class VaccineRegistrySummaryDto {
	@ApiProperty()
	id: number;

	@ApiProperty()
	vaccine: VaccineSummaryDto;

	@ApiProperty()
	dose: number;

	@ApiProperty()
	applicationDate: Date;

	@ApiProperty()
	expectedDate: Date;
}
