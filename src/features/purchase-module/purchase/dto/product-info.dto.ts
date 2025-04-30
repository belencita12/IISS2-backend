import { Product, ProductCost } from '@prisma/client';

export class ProductInfoDto implements Pick<Product, 'id' | 'name' | 'iva'> {
	id: number;
	name: string;
	iva: number;
	costs: ProductCost[];
}
