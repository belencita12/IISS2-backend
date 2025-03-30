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

	@IsOptional()
	@IsString()
	@ApiPropertyOptional()
	address?: string;

	@IsOptional()
	@IsString()
	@ApiPropertyOptional()
	phoneNumber?: string;

	@IsOptional()
	@IsString()
	@ApiPropertyOptional()
	fullName?: string;

	@IsOptional()
	@IsString()
	@ApiPropertyOptional()
	username?: string;

	@IsOptional()
	@IsString()
	@ApiPropertyOptional()
	email?: string;

	@IsOptional()
	@IsString()
	@ApiPropertyOptional()
	ruc?: string;
}
