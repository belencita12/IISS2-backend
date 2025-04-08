import { IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '@lib/commons/pagination-params.dto';
import { IsId } from '@lib/decorators/is-id.decorator';

export class PetQueryDto extends PaginationQueryDto {
	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	name?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@Type(() => Number)
	@IsId()
	speciesId?: number;

	@ApiPropertyOptional()
	@IsOptional()
	@Type(() => Number)
	@IsId()
	raceId?: number;

	@Type(() => Number)
	@IsOptional()
	@IsId()
	@ApiPropertyOptional()
	clientId?: number;
}
