import { IsId } from '@lib/decorators/is-id.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class CreateEmployeeDto {
	@Type(() => Number)
	@IsId()
	@ApiProperty({ example: 1 })
	positionId: number;

	@IsOptional()
	@ApiPropertyOptional({ type: 'string', format: 'binary' })
	profileImg?: Express.Multer.File;

	@IsString()
	@ApiProperty()
	fullName: string;

	@IsString()
	@IsEmail()
	@ApiProperty()
	email: string;

	@IsOptional()
	@IsString()
	@ApiPropertyOptional()
	adress?: string;

	@IsPhoneNumber()
	@ApiProperty()
	phoneNumber: string;

	@IsString()
	@ApiProperty()
	ruc: string;
}
