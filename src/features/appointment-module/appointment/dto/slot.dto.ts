import { ApiProperty } from '@nestjs/swagger';

export class SlotDto {
	@ApiProperty()
	time: string;

	@ApiProperty()
	isOcuppy: boolean;
}
