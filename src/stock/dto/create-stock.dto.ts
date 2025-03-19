import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStockDto {
	@IsString()
	@ApiProperty({
		description: 'Nombre del deposito.',
		example: 'Stock A',
	})
	name: string;

	@IsString()
	@ApiProperty({
		description: 'Direccion del deposito.',
		example: 'Encarnación',
	})
	address: string;
}
