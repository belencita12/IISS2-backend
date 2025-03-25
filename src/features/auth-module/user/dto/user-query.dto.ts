import { PaginationQueryDto } from '@lib/commons/pagination-params.dto';
import { Role } from '@lib/constants/role.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export class UserQueryDto extends PaginationQueryDto {
	@IsOptional()
	@IsEnum(Role)
	@ApiPropertyOptional({ enum: Role })
	role?: Role;
}
