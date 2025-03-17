import { IsId } from '@/lib/decorators/is-id.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class stockDto {
	@IsId()
	@ApiProperty({ example: 1 })
	id: number;

	@IsString()
	@IsNotEmpty()
	@ApiProperty({ example: 'Vacunas' })
	name: string;

	@IsString()
	@IsNotEmpty()
	@ApiProperty({ example: 'Deposito' })
	address: string;
}
