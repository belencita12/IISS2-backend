import { Injectable } from '@nestjs/common';
import { CreateMovementDetailDto } from './dto/create-movement-detail.dto';
import { UpdateMovementDetailDto } from './dto/update-movement-detail.dto';

@Injectable()
export class MovementDetailsService {
	create(createMovementDetailDto: CreateMovementDetailDto) {
		return 'This action adds a new movementDetail';
	}

	findAll() {
		return `This action returns all movementDetails`;
	}

	findOne(id: number) {
		return `This action returns a #${id} movementDetail`;
	}

	update(id: number, updateMovementDetailDto: UpdateMovementDetailDto) {
		return `This action updates a #${id} movementDetail`;
	}

	remove(id: number) {
		return `This action removes a #${id} movementDetail`;
	}
}
