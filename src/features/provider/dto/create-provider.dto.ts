import { IsRuc } from '@lib/decorators/validation/is-ruc';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsPhoneNumber } from 'class-validator';

export class CreateProviderDto {
	@ApiProperty({ example: 'Tech Supplies Inc.' })
	@IsString()
	businessName: string;

	@ApiProperty({ example: 'Proveedor de equipos tecnológicos' })
	@IsOptional()
	@IsString()
	description?: string;

	@IsPhoneNumber()
	@ApiProperty()
	phoneNumber: string;

	@ApiProperty()
	@IsRuc()
	ruc: string;
}
