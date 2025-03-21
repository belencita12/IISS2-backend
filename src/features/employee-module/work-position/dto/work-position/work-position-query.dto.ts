import { PaginationQueryDto } from '@lib/commons/pagination-params.dto';
import { IsTimeFormat } from '@lib/decorators/is-time-format';
import { IsWeekDay } from '@lib/decorators/is-week-day';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class WorkPositionQueryDto extends PaginationQueryDto {
	@IsString()
	@IsOptional()
	@ApiPropertyOptional()
	name?: string;

	@IsOptional()
	@Type(() => Number)
	@IsWeekDay()
	@ApiPropertyOptional({
		example: 2,
		description: 'Filtrar por el día de la semana 0 = domingo, 6 = sabado',
	})
	weekDay?: number;

	@IsOptional()
	@IsTimeFormat()
	@ApiPropertyOptional({
		example: '08:00',
		description: 'Filtrar por turnos que comienzan después de esta hora',
	})
	startTimeFrom?: string;

	@IsOptional()
	@IsTimeFormat()
	@ApiPropertyOptional({
		example: '12:00',
		description: 'Filtrar por turnos que comienzan antes de esta hora',
	})
	startTimeTo?: string;

	@IsOptional()
	@IsTimeFormat()
	@ApiPropertyOptional({
		example: '12:00',
		description: 'Filtrar por turnos que terminan después de esta hora',
	})
	endTimeFrom?: string;

	@IsOptional()
	@IsTimeFormat()
	@ApiPropertyOptional({
		example: '18:00',
		description: 'Filtrar por turnos que terminan antes de esta hora',
	})
	endTimeTo?: string;
}
