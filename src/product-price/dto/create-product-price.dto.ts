import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';

export class CreateProductPriceDto {
	@IsNumber({ maxDecimalPlaces: 2 })
	@IsPositive()
	@ApiProperty({ example: 10000 })
	amount: number;
}
