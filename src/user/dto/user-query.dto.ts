import { PaginationQueryDto } from '@/lib/commons/pagination-params.dto';
import { Role } from '@/lib/constants/role.enum';
import { IsId } from '@/lib/decorators/is-id.decorator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UserQueryDto extends PaginationQueryDto {
	@IsOptional()
	@IsString()
	@ApiPropertyOptional()
	query?: string;

	@IsOptional()
	@Type(() => Number)
	@IsId()
	@ApiPropertyOptional()
	speciesId?: number;

	@IsOptional()
	@Type(() => Number)
	@IsId()
	@ApiPropertyOptional()
	raceId: number;

	@IsOptional()
	@IsEnum(Role)
	@ApiPropertyOptional({ enum: Role })
	role?: Role;
}
