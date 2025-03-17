import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateStockDto {
	@IsString()
	@IsNotEmpty()
	@ApiProperty({ example: 'Vacunas' })
	name: string;

	@IsString()
	@IsNotEmpty()
	@ApiProperty({ example: 'Deposito' })
	address: string;
}
