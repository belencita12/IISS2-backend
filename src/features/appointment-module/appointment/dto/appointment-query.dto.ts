import { PaginationQueryDto } from '@lib/commons/pagination-params.dto';
import { IsId } from '@lib/decorators/validation/is-id.decorator';
import { QueryParam } from '@lib/decorators/validation/query-param.decorator';
import { AppointmentStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsString } from 'class-validator';

export class AppointmentQueryDto extends PaginationQueryDto {
	@QueryParam()
	@IsString()
	clientRuc?: string;

	@QueryParam()
	@IsString()
	employeeRuc?: string;

	@QueryParam()
	@IsId()
	serviceId?: number;

	@QueryParam()
	@IsDateString()
	fromDesignatedDate?: Date;

	@QueryParam()
	@IsDateString()
	toDesignatedDate?: Date;

	@QueryParam({ enum: AppointmentStatus })
	@IsEnum(AppointmentStatus)
	status?: AppointmentStatus;
}
