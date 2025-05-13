import { PaginationQueryDto } from '@lib/commons/pagination-params.dto';
import { IsId } from '@lib/decorators/validation/is-id.decorator';
import { QueryParam } from '@lib/decorators/validation/query-param.decorator';
import { Type } from 'class-transformer';
import { IsDateString } from 'class-validator';

export class AppointmentDetailQueryDto extends PaginationQueryDto {
	@IsId()
	@Type(() => Number)
	@QueryParam()
	serviceId?: number;

	@Type(() => Number)
	@QueryParam()
	fromPartialDuration?: number;

	@Type(() => Number)
	@QueryParam()
	toPartialDuration?: number;

	@IsId()
	@Type(() => Number)
	@QueryParam()
	appointmentId?: number;

	@IsDateString()
	@QueryParam()
	startAt?: Date;

	@IsDateString()
	@QueryParam()
	endAt?: Date;
}
