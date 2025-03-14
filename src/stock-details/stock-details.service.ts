import { Injectable } from '@nestjs/common';
import { CreateStockDetailDto } from './dto/create-stock-detail.dto';
import { UpdateStockDetailDto } from './dto/update-stock-detail.dto';

@Injectable()
export class StockDetailsService {
	create(createStockDetailDto: CreateStockDetailDto) {
		return 'This action adds a new stockDetail';
	}

	findAll() {
		return `This action returns all stockDetails`;
	}

	findOne(id: number) {
		return `This action returns a #${id} stockDetail`;
	}

	update(id: number, updateStockDetailDto: UpdateStockDetailDto) {
		return `This action updates a #${id} stockDetail`;
	}

	remove(id: number) {
		return `This action removes a #${id} stockDetail`;
	}
}
