import { ApiPropertyOptional } from '@nestjs/swagger';

export class VaccineManufacturerDto {
	@ApiPropertyOptional()
	id: number;

	@ApiPropertyOptional()
	name: string;

	constructor(partial: Partial<VaccineManufacturerDto>) {
		Object.assign(this, partial);
	}
}
