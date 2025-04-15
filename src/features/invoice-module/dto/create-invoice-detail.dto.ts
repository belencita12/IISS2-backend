import { ApiProperty } from '@nestjs/swagger';
import { IsId } from '@lib/decorators/validation/is-id.decorator';
import { IsPositiveNumber } from '@lib/decorators/validation/is-money.decorator';

export class CreateInvoiceDetailDto {
	@ApiProperty()
	@IsPositiveNumber('La Cantidad a vender')
	quantity: number;

	@ApiProperty()
	@IsId('El identificador del producto')
	productId: number;
}
