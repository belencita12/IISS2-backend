import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SignInResponseDto {
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
