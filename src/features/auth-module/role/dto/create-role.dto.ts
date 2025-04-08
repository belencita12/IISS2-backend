import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRoleDto {
	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	@Transform(({ value }) => (value as string).trim().toUpperCase())
	name: string;
}
