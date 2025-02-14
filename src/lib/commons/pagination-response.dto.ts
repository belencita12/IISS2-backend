import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsInt } from 'class-validator';

export class PaginationResponseDto<T> {
	@IsArray()
	@ApiProperty({ isArray: true, type: () => Object })
	data: T[];

	@IsInt()
	@ApiProperty()
	total: number;

	@IsInt()
	@ApiProperty()
	size: number;

	@IsBoolean()
	@ApiProperty()
	prev: boolean;

	@IsBoolean()
	@ApiProperty()
	next: boolean;

	@IsInt()
	@ApiProperty()
	currentPage: number;

	@IsInt()
	@ApiProperty()
	totalPages: number;
}
