import { ApiProperty } from '@nestjs/swagger';

export class ShortWorkPositionDto {
	constructor(data: Partial<ShortWorkPositionDto>) {
		Object.assign(this, data);
	}

	@ApiProperty({ example: 1 })
	id: number;

	@ApiProperty({ example: 'Auxiliar' })
	name: string;
}
