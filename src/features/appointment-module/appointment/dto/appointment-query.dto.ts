import { PaginationQueryDto } from '@lib/commons/pagination-params.dto';
import { IsDbDate } from '@lib/decorators/validation/is-db-date.decorator';
import { IsId } from '@lib/decorators/validation/is-id.decorator';
import { QueryParam } from '@lib/decorators/validation/query-param.decorator';
import { AppointmentStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsString } from 'class-validator';

export class AppointmentQueryDto extends PaginationQueryDto {
	@QueryParam()
	@IsString()
	search?: string;

	@QueryParam()
	@IsString()
	employeeRuc?: string;

	@Type(() => Number)
	@QueryParam()
	@IsId()
	serviceId?: number;

	@Type(() => Number)
	@QueryParam()
	@IsId()
	petId?: number;

	@QueryParam()
	@IsDbDate()
	fromDesignatedDate?: string;

	@QueryParam()
	@IsDbDate()
	toDesignatedDate?: string;

	@QueryParam({ enum: AppointmentStatus })
	@IsEnum(AppointmentStatus)
	status?: AppointmentStatus;
}
