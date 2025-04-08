import { PaginationQueryDto } from '@lib/commons/pagination-params.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SpeciesQueryDto extends PaginationQueryDto {
	@IsString()
	@IsOptional()
	@ApiPropertyOptional()
	name?: string;
}
