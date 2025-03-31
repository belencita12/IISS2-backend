import { PaginationQueryDto } from '@lib/commons/pagination-params.dto';
import { IsId } from '@lib/decorators/is-id.decorator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class ClientQueryDto extends PaginationQueryDto {
	@IsOptional()
	@IsString()
	@ApiPropertyOptional()
	query?: string;

	@ApiPropertyOptional({ example: 1 })
	@IsOptional()
	@Type(() => Number)
	@IsId()
	petSpeciesId?: number;

	@ApiPropertyOptional({ example: 1 })
	@IsOptional()
	@Type(() => Number)
	@IsId()
	petRaceId?: number;
}
