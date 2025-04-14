import { ApiProperty } from '@nestjs/swagger';

export class ServiceType {
	@ApiProperty()
	id: number;

	@ApiProperty()
	slug: string;

	@ApiProperty()
	name: string;

	@ApiProperty()
	description: string;

	@ApiProperty()
	durationMin: number;
}
