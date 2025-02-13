import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import {
	IsDate,
	IsDateString,
	IsInt,
	IsOptional,
	IsString,
} from 'class-validator';

export class RoleDto implements Role {
	@ApiProperty()
	@IsString()
	name: string;

	@ApiProperty()
	@IsInt()
	id: number;

	@ApiProperty()
	@IsDate()
	createdAt: Date;

	@ApiProperty()
	@IsDateString()
	updatedAt: Date;

	@IsOptional()
	@IsDateString()
	@ApiPropertyOptional()
	deletedAt: Date | null;
}
