import { PaginationQueryDto } from '@lib/commons/pagination-params.dto';
import { Role } from '@lib/constants/role.enum';
import { IsRuc } from '@lib/decorators/is-ruc';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class UserQueryDto extends PaginationQueryDto {
	@IsOptional()
	@IsString()
	@ApiPropertyOptional()
	query?: string;

	@IsString()
	@ApiPropertyOptional()
	adress?: string;

	@IsPhoneNumber()
	@ApiPropertyOptional()
	phoneNumber?: string;

	@IsString()
	@IsRuc()
	@ApiPropertyOptional()
	ruc?: string;

	@IsOptional()
	@IsEnum(Role)
	@ApiPropertyOptional({ enum: Role })
	role?: Role;
}
