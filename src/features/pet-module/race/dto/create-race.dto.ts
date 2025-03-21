import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateRaceDto {
	@ApiProperty({ example: 'Labrador' })
	@IsString()
	name: string;

	@ApiProperty({ example: 1 })
	@IsNumber()
	speciesId: number;
}
