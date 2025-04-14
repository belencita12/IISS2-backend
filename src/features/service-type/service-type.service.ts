import { Injectable } from '@nestjs/common';
import { CreateServiceTypeDto } from './dto/create-service-type.dto';
import { UpdateServiceTypeDto } from './dto/update-service-type.dto';

@Injectable()
export class ServiceTypeService {
	create(dto: CreateServiceTypeDto) {
		return 'This action adds a new serviceType';
	}

	findAll() {
		return `This action returns all serviceType`;
	}

	findOne(id: number) {
		return `This action returns a #${id} serviceType`;
	}

	update(id: number, dto: UpdateServiceTypeDto) {
		return `This action updates a #${id} serviceType`;
	}

	remove(id: number) {
		return `This action removes a #${id} serviceType`;
	}
}
