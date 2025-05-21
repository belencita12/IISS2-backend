import { Stamped, Stock } from '@prisma/client';
import { StampedDto } from './dto/stamped.dto';
import { toDate } from '@lib/utils/date';

export interface StampedEntity extends Stamped {
	stock: Stock;
}

export class StampedMapper {
	static toDto(data: StampedEntity): StampedDto {
		return {
			id: data.id,
			stampedNum: data.stampedNum,
			isActive: data.isActive,
			fromDate: toDate(data.fromDate),
			toDate: toDate(data.toDate),
			fromNum: data.fromNum,
			toNum: data.toNum,
			currentNum: data.currentNum,
			stock: {
				id: data.stock.id,
				name: data.stock.name,
				address: data.stock.address,
			},
		};
	}
}
