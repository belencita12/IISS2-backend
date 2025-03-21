import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class RevertMovementDto {
	@IsNumber()
	@IsOptional()
	@ApiPropertyOptional({
		description: 'ID del encargado que realiza la reversión',
		example: 5,
	})
	managerId?: number;

	@IsString()
	@IsOptional()
	@ApiPropertyOptional({
		description: 'Descripción personalizada para la reversión ',
		example: 'Reversión por error en transferencia',
	})
	description?: string;
}
