import { OmitType } from '@nestjs/swagger';
import { ProductDto } from './product.dto';

export class PublicProductDto extends OmitType(ProductDto, [
	'code',
	'cost',
	'provider',
	'quantity',
	'updatedAt',
	'createdAt',
	'deletedAt',
]) {}
