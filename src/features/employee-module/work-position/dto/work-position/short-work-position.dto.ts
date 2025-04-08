import { ApiProperty } from '@nestjs/swagger';
import { WorkPosition } from '@prisma/client';

export class ShortWorkPositionDto {
	constructor(data: WorkPosition) {
		this.id = data.id;
		this.name = data.name;
	}

	@ApiProperty({ example: 1 })
	id: number;

	@ApiProperty({ example: 'Auxiliar' })
	name: string;
}
