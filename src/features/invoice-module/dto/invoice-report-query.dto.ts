import { IsDbDate } from '@lib/decorators/validation/is-db-date.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class InvoiceReportQueryDto {
	@IsDbDate()
	@ApiProperty({ example: '2025-01-01' })
	from: string;

	@IsDbDate()
	@ApiProperty({ example: '2025-12-31' })
	to: string;
}
