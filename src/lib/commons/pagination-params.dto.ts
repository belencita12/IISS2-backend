import { IsBoolean, IsDate, IsInt, IsOptional, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	ToEndOfDay,
	ToStartOfDay,
} from '@lib/decorators/validation/to-date.decorator';

export class PaginationQueryDto {
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@ApiProperty()
	page: number;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@ApiPropertyOptional()
	size?: number;

	@IsOptional()
	@ToStartOfDay()
	@IsDate({ message: 'Fecha inicio debe ser una fecha valida' })
	@ApiProperty({ required: false })
	from?: string;

	@IsOptional()
	@ToEndOfDay()
	@IsDate({ message: 'Fecha fin debe ser una fecha valida' })
	@ApiProperty({ required: false })
	to?: string;

	@Transform(({ value }) => (value === undefined ? false : value === 'true'))
	@IsBoolean()
	@IsOptional()
	@ApiProperty({ required: false })
	includeDeleted?: boolean = false;
}
