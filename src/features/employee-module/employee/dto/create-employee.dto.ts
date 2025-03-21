import { IsId } from '@lib/decorators/is-id.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateEmployeeDto {
	@IsString()
	@ApiProperty()
	fullName: string;

	@IsString()
	@IsNotEmpty()
	@ApiProperty({ example: '1234567-1' })
	ruc: string;

	@IsString()
	@IsEmail()
	@ApiProperty()
	email: string;

	@Type(() => Number)
	@IsId()
	@ApiProperty({ example: 1 })
	positionId: number;

	@IsOptional()
	@ApiPropertyOptional({ type: 'string', format: 'binary' })
	profileImg?: Express.Multer.File;
}
