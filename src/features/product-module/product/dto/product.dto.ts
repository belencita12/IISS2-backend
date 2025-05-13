import { ImageDto } from '@lib/commons/image.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Category } from '@prisma/client';
import { ProductProvider } from './product-provider.dto';

export class ProductDto {
	@ApiProperty({ example: 1 })
	id: number;

	@ApiProperty({ example: 'Wiskas Cachorros 500gr' })
	name: string;

	@ApiProperty({
		example: 'Es un paquete de comida de la marca Wiskas y trae 500gr',
	})
	description: string;

	@ApiProperty({ example: '127319231972' })
	code: string;

	@ApiProperty({ example: 10000 })
	cost: number;

	@ApiProperty({ example: 0.1 })
	iva: number;

	@ApiProperty({ type: ProductProvider })
	provider?: ProductProvider;

	@ApiProperty({ enum: Category })
	category: Category;

	@ApiProperty({ example: 40000 })
	price: number;

	@ApiPropertyOptional({ type: ImageDto })
	image?: ImageDto;

	@ApiProperty({ example: 20 })
	quantity: number;

	@ApiPropertyOptional({ type: [String] })
	tags: string[];

	@ApiProperty()
	createdAt: Date;

	@ApiProperty()
	updatedAt: Date;

	@ApiPropertyOptional()
	deletedAt: Date | null;
}
