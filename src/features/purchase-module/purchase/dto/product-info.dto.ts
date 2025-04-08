import { Product } from '@prisma/client';
import Decimal from 'decimal.js';

export class ProductInfoDto
	implements Pick<Product, 'id' | 'name' | 'iva' | 'cost'>
{
	id: number;
	name: string;
	iva: number;
	cost: Decimal;
}
