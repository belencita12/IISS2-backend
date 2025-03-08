import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SpeciesDto {
	@ApiPropertyOptional()
	id: number;

	@ApiProperty({ example: 'Canino' })
	name: string;

	constructor(partial: Partial<SpeciesDto>) {
		Object.assign(this, partial);
	}
}
