import { PaginationQueryDto } from '@lib/commons/pagination-params.dto';
import { IsId } from '@lib/decorators/validation/is-id.decorator';
import { QueryParam } from '@lib/decorators/validation/query-param.decorator';
import { ToBoolean } from '@lib/decorators/validation/to-boolean.decorator';
import { NotificationScope, NotificationType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsString } from 'class-validator';

export class NotificationQueryDto extends PaginationQueryDto {
	@QueryParam()
	@IsString()
	searchContent?: string;

	@QueryParam()
	@IsString()
	searchSubject?: string;

	@QueryParam()
	@Type(() => Number)
	@IsId('El identificador del usuario no es valido')
	userId?: number;

	@IsEnum(NotificationScope)
	@QueryParam({ enum: NotificationScope })
	scope: NotificationScope;

	@IsEnum(NotificationType)
	@QueryParam({ enum: NotificationType })
	type: NotificationType;

	@QueryParam()
	@ToBoolean()
	isRead?: boolean;

	@QueryParam()
	@IsDateString()
	fromArrivalDate?: string;

	@QueryParam()
	@IsDateString()
	toArrivalDate?: string;
}
