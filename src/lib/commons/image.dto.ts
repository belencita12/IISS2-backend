import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsString } from 'class-validator';

export class ImageDto {
	@IsInt()
	@IsPositive()
	@ApiProperty({ example: 1 })
	id: number;

	@IsString()
	@ApiProperty({ example: 'https://example-images.com/preview.jpg' })
	previewUrl: string;

	@IsString()
	@ApiProperty({ example: 'https://example-images.com/preview.jpg' })
	originalUrl: string;
}
