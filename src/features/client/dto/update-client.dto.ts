import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { CreateClientDto } from './create-client.dto';
import { IsOptional } from 'class-validator';

export class UpdateClientDto extends PartialType(
	OmitType(CreateClientDto, ['roles', 'password']),
) {
	@IsOptional()
	@ApiPropertyOptional({ type: 'string', format: 'binary' })
	profileImg?: Express.Multer.File;
}
