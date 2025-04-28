import { IsId } from '@lib/decorators/validation/is-id.decorator';
import { IsIVA } from '@lib/decorators/validation/is-iva';
import { IsPositiveNumber } from '@lib/decorators/validation/is-money.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Category } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString,
	IsArray,
} from 'class-validator';

export class CreateProductDto {
	@IsString()
	@IsNotEmpty()
	@ApiProperty({ example: 'Wiskas Cachorros 500gr' })
	name: string;

	@IsOptional()
	@IsEnum(Category)
	@ApiProperty({ enum: Category })
	category?: Category;

	@IsIVA()
	@Transform(() => Number)
	@ApiProperty({ example: 10 })
	iva: number;

	@IsId()
	@Type(() => Number)
	@ApiProperty({ example: 1 })
	providerId: number;

	@IsOptional()
	@ApiPropertyOptional({ type: 'string', format: 'binary' })
	productImg?: Express.Multer.File;

	@Type(() => Number)
	@IsPositiveNumber()
	@ApiProperty({ example: 40000 })
	price: number;

	@Type(() => Number)
	@IsPositiveNumber()
	@ApiProperty({ example: 10000 })
	cost: number;

	@IsArray()
	@Transform(({ value }: { value: string }) =>
		Array.isArray(value) ? value : value.split(',').map((tag) => tag.trim()),
	)
	@ApiPropertyOptional({ type: [String] })
	tags?: string[];
}
