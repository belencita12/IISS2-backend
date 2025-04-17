import { IsDuration } from '@lib/decorators/validation/is-duration.decorator';
import { IsIVA } from '@lib/decorators/validation/is-iva';
import { IsSlug } from '@lib/decorators/validation/is-slug.decorator';
import { IsStrLen } from '@lib/decorators/validation/is-str-len.decorator';
import { IsTag } from '@lib/decorators/validation/is-tag.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsPositive } from 'class-validator';

export class CreateServiceTypeDto {
	@ApiProperty()
	@IsSlug()
	slug: string;

	@ApiProperty()
	@IsStrLen(3, 64)
	name: string;

	@ApiProperty()
	@IsStrLen(10, 256)
	description: string;

	@Type(() => Number)
	@IsDuration()
	@ApiProperty({ example: 15 })
	durationMin: number;

	@Type(() => Number)
	@IsIVA()
	@ApiProperty({ example: 0.1 })
	iva: number;

	@Type(() => Number)
	@IsNumber()
	@IsPositive()
	@ApiProperty({ example: 40000 })
	price: number;

	@IsOptional()
	@IsTag()
	@ApiPropertyOptional({ type: [String] })
	tags?: string[];

	@IsOptional()
	@ApiPropertyOptional({ type: 'string', format: 'binary' })
	img?: Express.Multer.File;
}
