import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsDateString, IsInt, IsNumber, IsOptional } from 'class-validator';

export class MovementDetailDto {
	@IsNumber()
	@ApiProperty({ description: 'ID del producto asociado', example: 1 })
	productId: number;

	@IsNumber()
	@ApiProperty({ description: 'ID del movimiento asociado', example: 1 })
	movementId?: number;

	@IsInt()
	@ApiProperty({ description: 'Cantidad de productos movidos', example: 10 })
	quantity: number;

	@Expose()
	@IsDateString()
	@ApiProperty()
	createdAt: Date;

	@Expose()
	@IsDateString()
	@ApiProperty()
	updatedAt: Date;

	@Expose()
	@IsOptional()
	@IsDateString()
	@ApiPropertyOptional()
	deletedAt: Date | null;

	constructor(partial: Partial<MovementDetailDto>) {
		Object.assign(this, partial);
	}
}
