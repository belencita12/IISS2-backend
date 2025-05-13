import { ProductEntity } from '@features/product-module/product/dto/product.dto';
import { ImageDto } from '@lib/commons/image.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceType } from '@prisma/client';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

export interface ServiceTypeEntity extends ServiceType {
	product: ProductEntity;
}

export class ServiceTypeDto {
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
	maxColabs?: number;

	@ApiProperty()
	isPublic: boolean;

	@ApiProperty()
	iva: number;

	@ApiProperty()
	price: number;

	@ApiProperty()
	cost: number;

	@ApiPropertyOptional()
	tags?: string[];

	@ValidateNested()
	@Type(() => ImageDto)
	@ApiPropertyOptional({ type: ImageDto })
	img?: ImageDto;
}
