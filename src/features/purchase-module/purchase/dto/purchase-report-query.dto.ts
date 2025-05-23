import { IsDbDate } from '@lib/decorators/validation/is-db-date.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class PurchaseReportQueryDto {
	@IsDbDate()
	@ApiProperty({ example: '2025-02-12' })
	from: string;

	@IsDbDate()
	@ApiProperty({ example: '2025-12-12' })
	to: string;
}
