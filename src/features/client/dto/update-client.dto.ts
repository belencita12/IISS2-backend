import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateClientDto } from './create-client.dto';
import { IsOptional } from 'class-validator';

export class UpdateClientDto extends PartialType(CreateClientDto) {
	@IsOptional()
	@ApiPropertyOptional({ type: 'string', format: 'binary' })
	profileImg?: Express.Multer.File;
	roles = undefined;
	password = undefined;
}
