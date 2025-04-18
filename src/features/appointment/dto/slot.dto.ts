import { ApiProperty } from '@nestjs/swagger';

export class Slot {
	@ApiProperty()
	time: string;

	@ApiProperty()
	isOcuppy: boolean;
}
