import { ImageDto } from '@lib/commons/image.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PublicServiceTypeDto {
	@ApiProperty()
	id: number;

	@ApiProperty()
	slug: string;

	@ApiProperty()
	name: string;

	@ApiProperty()
	description: string;

	@ApiProperty()
	durationMin: number;

	@ApiProperty()
	iva: number;

	@ApiProperty()
	price: number;

	@ApiPropertyOptional()
	tags?: string[];

	@ApiPropertyOptional({ type: ImageDto })
	img?: ImageDto;
}
