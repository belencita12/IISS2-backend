import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role, User } from '@prisma/client';
import { Exclude, Expose, Transform } from 'class-transformer';
import {
	IsDateString,
	IsEmail,
	IsNumber,
	IsOptional,
	IsString,
} from 'class-validator';

export class UserDto implements User {
	constructor(partial: Partial<UserDto>) {
		Object.assign(this, partial);
	}

	@Expose()
	@IsNumber()
	@ApiProperty()
	id: number;

	@Expose()
	@IsString()
	@ApiProperty()
	fullName: string;

	@Expose()
	@IsString()
	@ApiProperty()
	username: string;

	@Expose()
	@IsString()
	@IsEmail()
	@ApiProperty()
	email: string;

	@Expose()
	@Transform(({ value }) => value.map((role: Role) => role.name), {
		toClassOnly: true,
	})
	@ApiProperty({ type: [String] })
	roles: string[];

	@Expose()
	@IsDateString()
	@ApiProperty()
	createdAt: Date;

	@Expose()
	@IsDateString()
	@ApiProperty()
	updatedAt: Date;

	@Expose()
	@IsOptional()
	@IsDateString()
	@ApiPropertyOptional()
	deletedAt: Date | null;

	@Exclude()
	password: string;
}
