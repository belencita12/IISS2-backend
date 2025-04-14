import { Product, StockDetails } from '@prisma/client';
import Decimal from 'decimal.js';

export interface StockDetailInfo extends StockDetails {
	product: Product & { price: { amount: Decimal } };
}
