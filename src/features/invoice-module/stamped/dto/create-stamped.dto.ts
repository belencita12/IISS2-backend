import { IsDbDate } from '@lib/decorators/validation/is-db-date.decorator';
import { IsInvoiceStamped } from '@lib/decorators/validation/is-invoice-stamped.decorator';
import { IsPositiveNumber } from '@lib/decorators/validation/is-money.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStampedDto {
	@ApiProperty({ example: '12345678' })
	@IsInvoiceStamped()
	stampedNum: string;

	@ApiProperty({ example: '2025-04-12' })
	@IsDbDate()
	fromDate: string;

	@ApiProperty({ example: '2025-04-12' })
	@IsDbDate()
	toDate: string;

	@ApiProperty()
	@IsPositiveNumber('El número de inicio')
	fromNum: number;

	@ApiProperty()
	@IsPositiveNumber('El número de fin')
	toNum: number;
}
