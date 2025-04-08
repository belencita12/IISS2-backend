import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Category } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
	IsEnum,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsPositive,
	IsString,
	IsArray,
} from 'class-validator';

export class CreateProductDto {
	@IsString()
	@IsNotEmpty()
	@ApiProperty({ example: 'Wiskas Cachorros 500gr' })
	name: string;

	@Transform(({ value }) => Number(value))
	@IsNumber()
	@IsPositive()
	@ApiProperty({ example: 10000 })
	cost: number;

	@IsEnum(Category)
	@IsOptional()
	@ApiProperty({ enum: Category })
	category: Category;

	@Transform(({ value }) => Number(value))
	@IsNumber()
	@IsPositive()
	@ApiProperty({ example: 0.1 })
	iva: number;

	@IsOptional()
	@ApiPropertyOptional({ type: 'string', format: 'binary' })
	productImg?: Express.Multer.File;

	@Transform(({ value }) => Number(value))
	@IsNumber()
	@IsPositive()
	@ApiProperty({ example: 40000 })
	price: number;

	@IsArray()
	@Transform(({ value }: { value: string }) =>
		Array.isArray(value) ? value : value.split(',').map((tag) => tag.trim()),
	)
	@ApiPropertyOptional({ type: [String] })
	tags?: string[];
}
