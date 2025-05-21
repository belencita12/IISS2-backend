import { ProviderDto } from '@features/provider/dto/provider.dto';
import {
	StockDto,
	StockEntity,
} from '@features/stock-module/stock/dto/stock.dto';
import { toDate } from '@lib/utils/date';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Provider, Purchase } from '@prisma/client';

export interface PurchaseEntity extends Purchase {
	provider: Provider;
	stock: StockEntity;
}

export class PurchaseDto {
	@ApiProperty({ example: 1 })
	id: number;

	@ApiProperty({ example: 0.1 })
	ivaTotal: number;

	@ApiProperty({ example: 1000000 })
	total: number;

	@ApiPropertyOptional({ example: '2025-05-24' })
	date: string;

	@ApiProperty({ type: ProviderDto })
	provider: ProviderDto;

	@ApiProperty({ type: StockDto })
	stock: StockDto;

	constructor(data: PurchaseEntity) {
		this.id = data.id;
		this.ivaTotal = data.ivaTotal;
		this.total = data.total.toNumber();
		this.provider = new ProviderDto(data.provider);
		this.stock = new StockDto(data.stock);
		this.date = toDate(data.date);
	}
}
