import { PaginationQueryDto } from '@lib/commons/pagination-params.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, IsString, IsPositive } from 'class-validator';

export class EmployeeQueryDto extends PaginationQueryDto {
	@IsOptional()
	@IsString()
	@ApiPropertyOptional()
	query?: string;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@IsPositive()
	@ApiPropertyOptional()
	positionId?: number;

	@IsOptional()
	@IsString()
	@ApiPropertyOptional()
	positionName?: string;

	@IsOptional()
	@IsString()
	@ApiPropertyOptional()
	email?: string;

	@IsOptional()
	@IsString()
	@ApiPropertyOptional()
	fullName?: string;

	@IsOptional()
	@IsString()
	@ApiPropertyOptional()
	adress?: string;

	@IsOptional()
	@IsString()
	@ApiPropertyOptional()
	ruc?: string;
}
