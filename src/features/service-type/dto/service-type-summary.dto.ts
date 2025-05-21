import { ApiProperty } from '@nestjs/swagger';

export class ServiceTypeSummaryDto {
	@ApiProperty()
	id: number;

	@ApiProperty()
	name: string;
}
