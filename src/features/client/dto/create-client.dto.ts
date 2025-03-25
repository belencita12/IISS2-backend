import { CreateUserDto } from '@features/auth-module/user/dto/create-user.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClientDto extends CreateUserDto {
	@ApiProperty({ example: ['USER'], readOnly: true })
	readonly roles: string[] = ['USER'];
}
