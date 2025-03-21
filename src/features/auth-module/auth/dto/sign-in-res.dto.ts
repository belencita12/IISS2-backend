import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class SignInResponseDto {
	@ApiProperty()
	@IsInt()
	id: number;

	@ApiProperty()
	@IsString()
	fullName: string;

	@ApiProperty()
	@IsString()
	username: string;

	@IsString()
	@ApiProperty()
	token: string;

	@IsString()
	@ApiProperty({ isArray: true })
	roles: string[];
}
