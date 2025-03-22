import { UserQueryDto } from '@features/auth-module/user/dto/user-query.dto';
import { Role } from '@lib/constants/role.enum';
import { IsId } from '@lib/decorators/is-id.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class ClientQueryDto extends UserQueryDto {
	@ApiProperty({ enum: Role, readOnly: true })
	role: Role = Role.User;

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
