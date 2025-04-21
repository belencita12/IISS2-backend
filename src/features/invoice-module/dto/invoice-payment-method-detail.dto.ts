import { IsId } from '@lib/decorators/validation/is-id.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class InvoicePaymentMethodDetailDto {
	@IsId()
	@ApiProperty()
	methodId: number;

	@IsInt()
	@IsPositive()
	@ApiProperty()
	amount: number;
}
