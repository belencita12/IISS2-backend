import { EmployeeDto } from '@features/employee-module/employee/dto/employee.dto';
import { StockDto } from '@features/stock-module/stock/dto/stock.dto';
import { toDate } from '@lib/utils/date';
import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { Movement, MovementType, Stock, User } from '@prisma/client';
import { IsNumber, IsString } from 'class-validator';

export class MinStockDto extends PickType(StockDto, ['id', 'name']) {}

export class MinEmployeeDto extends PickType(EmployeeDto, [
	'fullName',
	'id',
	'ruc',
]) {}

export interface MovementEntity extends Movement {
	originStock: Stock | null;
	destinationStock: Stock | null;
	manager: { user: User };
}

export class MovementDto {
	@IsNumber()
	@ApiProperty({ example: 1 })
	id: number;

	@IsString()
	@ApiPropertyOptional({ example: 'Transferencia de inventario' })
	description?: string;

	@IsNumber()
	@ApiProperty({ example: 5 })
	manager: MinEmployeeDto;

	@ApiProperty({ enum: MovementType })
	type: MovementType;

	@ApiProperty({ example: '2025-03-19' })
	dateMovement: string;

	@ApiPropertyOptional({ example: 1 })
	originStock?: MinStockDto;

	@ApiProperty({ example: 2 })
	destinationStock?: MinStockDto;

	constructor(data: MovementEntity) {
		this.id = data.id;
		this.description = data.description || undefined;
		this.manager = {
			fullName: data.manager.user.fullName,
			id: data.manager.user.id,
			ruc: data.manager.user.ruc,
		};
		this.type = data.type;
		this.dateMovement = toDate(data.dateMovement);
		this.originStock = data.originStock
			? {
					id: data.originStock.id,
					name: data.originStock.name,
				}
			: undefined;
		this.destinationStock = data.destinationStock
			? {
					id: data.destinationStock.id,
					name: data.destinationStock.name,
				}
			: undefined;
	}
}
