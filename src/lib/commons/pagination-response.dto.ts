import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt } from 'class-validator';

export class PaginationResponseDto<T> {
	@IsArray()
	@ApiProperty({ isArray: true, type: () => Object })
	data: T[];

	@IsInt()
	@ApiProperty()
	total: number;

	@IsInt()
	@ApiProperty()
	take: number;

	@IsInt()
	@ApiProperty()
	skip: number;
}
