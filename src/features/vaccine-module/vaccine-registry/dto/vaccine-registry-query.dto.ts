import { QueryParam } from '@lib/decorators/validation/query-param.decorator';
import { PaginationQueryDto } from '@lib/commons/pagination-params.dto';
import { IsId } from '@lib/decorators/validation/is-id.decorator';
import { IsDateString, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class VaccineRegistryQueryDto extends PaginationQueryDto {
	@Type(() => Number)
	@QueryParam()
	@IsId()
	vaccineId?: number;

	@Type(() => Number)
	@QueryParam()
	@IsId()
	petId?: number;

	@QueryParam()
	@IsString()
	clientName?: string;

	@Type(() => Number)
	@QueryParam()
	@IsNumber()
	dose?: number;

	@QueryParam()
	@IsDateString()
	toExpectedDate?: string;

	@QueryParam()
	@IsDateString()
	fromExpectedDate?: string;

	@QueryParam()
	@IsDateString()
	toApplicationDate?: string;

	@QueryParam()
	@IsDateString()
	fromApplicationDate?: string;
}
