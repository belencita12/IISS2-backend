import { PaginationQueryDto } from '@/lib/commons/pagination-params.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class WorkPositionQueryDto extends PaginationQueryDto {
	@IsString()
	@IsOptional()
	@ApiPropertyOptional()
	name?: string;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(0)
	@Max(6)
	@ApiPropertyOptional({
		example: 2,
		description: 'Filtrar por el día de la semana 0 = domingo, 6 = sabado',
	})
	weekDay?: number;

	@IsOptional()
	@IsString()
	@ApiPropertyOptional({
		example: '08:00',
		description: 'Filtrar por turnos que comienzan después de esta hora',
	})
	startTimeFrom?: string;

	@IsOptional()
	@IsString()
	@ApiPropertyOptional({
		example: '12:00',
		description: 'Filtrar por turnos que comienzan antes de esta hora',
	})
	startTimeTo?: string;

	@IsOptional()
	@IsString()
	@ApiPropertyOptional({
		example: '12:00',
		description: 'Filtrar por turnos que terminan después de esta hora',
	})
	endTimeFrom?: string;

	@IsOptional()
	@IsString()
	@ApiPropertyOptional({
		example: '18:00',
		description: 'Filtrar por turnos que terminan antes de esta hora',
	})
	endTimeTo?: string;
}
