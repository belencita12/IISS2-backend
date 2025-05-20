import { StockSummaryDto } from '@features/stock-module/stock/dto/stock-summary.dto';
import { ApiProperty } from '@nestjs/swagger';

export class StampedDto {
	@ApiProperty()
	id: number;

	@ApiProperty({ example: '12345678' })
	stampedNum: string;

	@ApiProperty()
	isActive: boolean;

	@ApiProperty({ type: StockSummaryDto })
	stock: StockSummaryDto;

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
}
