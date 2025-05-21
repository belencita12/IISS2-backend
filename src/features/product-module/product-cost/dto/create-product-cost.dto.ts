import { IsId } from '@lib/decorators/validation/is-id.decorator';
import { IsPositiveNumber } from '@lib/decorators/validation/is-money.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductCostDto {
	@ApiProperty()
	@IsPositiveNumber()
	cost: number;

	@ApiProperty()
	@IsId()
	productId: number;
}
