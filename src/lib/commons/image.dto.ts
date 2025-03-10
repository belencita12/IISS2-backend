import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsString } from 'class-validator';

export class ImageDto {
	@IsString()
	@ApiProperty()
	previewUrl: string;

	@IsString()
	@ApiProperty()
	originalUrl: string;

	@IsInt()
	@IsPositive()
	@ApiProperty()
	id: number;
}
