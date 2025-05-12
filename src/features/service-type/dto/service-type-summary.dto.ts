import { ApiProperty } from '@nestjs/swagger';

export class ServiceTypeSummaryDto {
	@ApiProperty()
	id: number;

	@ApiProperty()
	name: string;

	@ApiProperty()
	description: string;

	@ApiProperty()
	durationMin: number;

	@ApiProperty()
	price: number;

	@ApiProperty()
	cost: number;
}
