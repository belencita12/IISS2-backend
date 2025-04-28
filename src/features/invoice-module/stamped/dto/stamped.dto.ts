import { toDate } from '@lib/utils/date';
import { ApiProperty } from '@nestjs/swagger';
import { Stamped } from '@prisma/client';

export class StampedDto {
	@ApiProperty()
	id: number;

	@ApiProperty({ example: '12345678' })
	stampedNum: string;

	@ApiProperty({ example: '2025-04-12' })
	fromDate: string;

	@ApiProperty({ example: '2025-04-12' })
	toDate: string;

	@ApiProperty()
	fromNum: number;

	@ApiProperty()
	toNum: number;

	@ApiProperty()
	currentNum: number;

	constructor(data: Stamped) {
		this.id = data.id;
		this.stampedNum = data.stampedNum;
		this.fromDate = toDate(data.fromDate);
		this.toDate = toDate(data.toDate);
		this.fromNum = data.fromNum;
		this.toNum = data.toNum;
		this.currentNum = data.currentNum;
	}
}
