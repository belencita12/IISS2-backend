import { PaginationQueryDto } from '@lib/commons/pagination-params.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MovementType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
	IsDate,
	IsEnum,
	IsNumber,
	IsOptional,
	IsString,
} from 'class-validator';

export class MovementQueryDto extends PaginationQueryDto {
	@IsOptional()
	@IsString()
	@ApiPropertyOptional()
	managerRuc?: string;

	@IsOptional()
	@IsEnum(MovementType)
	@ApiPropertyOptional({
		description: 'Tipo de movimiento',
		enum: MovementType,
		enumName: 'MovementType',
	})
	type?: MovementType;

	@IsOptional()
	@Type(() => Date)
	@IsDate()
	@ApiPropertyOptional({
		description: 'Fecha inicial para filtrar movimientos',
	})
	fromDate?: Date;

	@IsOptional()
	@Type(() => Date)
	@IsDate()
	@ApiPropertyOptional({
		description: 'Fecha final para filtrar movimientos',
	})
	toDate?: Date;

	@IsNumber()
	@IsOptional()
	@Type(() => Number)
	@ApiPropertyOptional({
		description: 'ID del stock de origen',
	})
	originStockId?: number;

	@IsNumber()
	@IsOptional()
	@Type(() => Number)
	@ApiPropertyOptional({
		description: 'ID del stock de destino',
	})
	destinationStockId?: number;

	@IsOptional()
	@IsString()
	@ApiPropertyOptional()
	productName?: string;
}
