import { ImageDto } from '@lib/commons/image.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import {
	IsDateString,
	IsEmail,
	IsNumber,
	IsOptional,
	IsString,
} from 'class-validator';

export class UserDto {
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
	@ApiProperty({ type: [String] })
	roles: string[];

	@Expose()
	@IsOptional()
	@ApiPropertyOptional()
	image?: ImageDto;

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
