import { ApiProperty } from '@nestjs/swagger';

export class SpeciesDto {
	@ApiProperty({ example: 1 })
	id: number;

	@ApiProperty({ example: 'Canino' })
	name: string;

	constructor(partial: Partial<SpeciesDto>) {
		Object.assign(this, partial);
	}
}
