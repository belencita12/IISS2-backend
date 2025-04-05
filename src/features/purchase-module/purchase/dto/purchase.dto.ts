import { ProviderDto } from '@features/provider/dto/provider.dto';
import { StockDto } from '@features/stock-module/stock/dto/stock.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Provider, Purchase, Stock } from '@prisma/client';

export interface PurchaseEntity extends Purchase {
	provider: Provider;
	stock: Stock;
}

export class PurchaseDto {
	@ApiProperty({ example: 1 })
	id: number;

	@ApiProperty({ example: 0.1 })
	ivaTotal: number;

	@ApiProperty({ example: 1000000 })
	total: number;

	@ApiPropertyOptional()
	date: Date;

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
		this.date = data.date;
	}
}
