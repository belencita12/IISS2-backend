import { ExtendedTransaction } from '@features/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductPricingService {
	async resetProductCostHistory(tx: ExtendedTransaction, productId: number) {
		await tx.productCost.updateMany({
			where: { productId, isActive: true },
			data: { isActive: false },
		});
	}

	async resetProductPriceHistory(tx: ExtendedTransaction, productId: number) {
		await tx.productPrice.updateMany({
			where: { productId, isActive: true },
			data: { isActive: false },
		});
	}
}
