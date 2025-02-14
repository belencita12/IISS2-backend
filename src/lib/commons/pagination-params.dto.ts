import {
	IsBoolean,
	IsDateString,
	IsInt,
	IsOptional,
	Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
	@IsDateString()
	@ApiProperty({ required: false })
	from?: string;

	@IsOptional()
	@IsDateString()
	@ApiProperty({ required: false })
	to?: string;

	@Transform(({ value }) => (value === undefined ? false : value === 'true'))
	@IsBoolean()
	@IsOptional()
	@ApiProperty({ required: false })
	includeDeleted?: boolean = false;
}
