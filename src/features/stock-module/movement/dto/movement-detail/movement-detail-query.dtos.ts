import { PaginationQueryDto } from '@lib/commons/pagination-params.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class MovementDetailQueryDto extends PaginationQueryDto {
	@IsNumber()
	@ApiProperty({ description: 'ID del producto asociado' })
	productId?: number;

	@IsNumber()
	@ApiProperty({ description: 'ID del movimiento asociado' })
	movementId?: number;

	@IsNumber()
	@ApiProperty({ description: 'Cantidad de productos movidos' })
	quantity?: number;
}
