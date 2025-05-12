import { ServiceTypeSummaryDto } from '@features/service-type/dto/service-type-summary.dto';
import { VaccineRegistrySummaryDto } from '@features/vaccine-module/vaccine-registry/dto/vaccine-registry-summary.dto';
import { ApiProperty } from '@nestjs/swagger';

export class AppointmentDetailDto {
	@ApiProperty({ type: ServiceTypeSummaryDto })
	service: ServiceTypeSummaryDto;

	@ApiProperty({ type: [VaccineRegistrySummaryDto] })
	vaccineRegistries: VaccineRegistrySummaryDto[];
}
