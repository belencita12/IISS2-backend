import { IsDuration } from '@lib/decorators/validation/is-duration.decorator';
import { IsIVA } from '@lib/decorators/validation/is-iva';
import { IsPositiveNumber } from '@lib/decorators/validation/is-money.decorator';
import { IsSlug } from '@lib/decorators/validation/is-slug.decorator';
import { IsStrLen } from '@lib/decorators/validation/is-str-len.decorator';
import { IsTag } from '@lib/decorators/validation/is-tag.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsPositive, Max } from 'class-validator';

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
	@ApiProperty({ example: 10 })
	@IsIVA()
	iva: number;

	@Type(() => Number)
	@IsInt()
	@IsPositive()
	@ApiProperty({ example: 40000 })
	price: number;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@IsPositive()
	@Max(5)
	@ApiPropertyOptional({ example: 3 })
	maxColabs?: number;

	@Type(() => Number)
	@IsPositiveNumber()
	@ApiProperty()
	cost: number;

	@IsOptional()
	@Type(() => Boolean)
	@IsBoolean()
	@ApiPropertyOptional()
	isPublic?: boolean;

	@IsOptional()
	@IsTag()
	@ApiPropertyOptional({ type: [String] })
	tags?: string[];

	@IsOptional()
	@ApiPropertyOptional({ type: 'string', format: 'binary' })
	img?: Express.Multer.File;
}
