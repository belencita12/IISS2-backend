import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsId } from '@lib/decorators/validation/is-id.decorator';

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

	@IsId()
	@ApiProperty({
		description: 'Timbrado del deposito.',
		example: 1,
	})
	stampedId: number;
}
