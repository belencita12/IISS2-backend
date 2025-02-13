import {
	IsBoolean,
	IsDateString,
	IsInt,
	IsOptional,
	IsPositive,
	Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PaginationQueryDto {
	@Type(() => Number)
	@IsInt()
	@Min(0)
	@ApiProperty()
	skip: number;

	@Type(() => Number)
	@IsInt()
	@IsPositive()
	@ApiProperty()
	take: number;

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
	includeDeleted: boolean = false;
}
