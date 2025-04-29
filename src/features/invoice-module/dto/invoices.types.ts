import { Product, ProductPrice, StockDetails } from '@prisma/client';

export interface StockDetailInfo extends StockDetails {
	product: Product & { prices: ProductPrice[] };
}
