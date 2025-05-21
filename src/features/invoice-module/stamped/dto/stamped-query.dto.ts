import { PaginationQueryDto } from '@lib/commons/pagination-params.dto';
import { IsDbDate } from '@lib/decorators/validation/is-db-date.decorator';
import { IsId } from '@lib/decorators/validation/is-id.decorator';
import { QueryParam } from '@lib/decorators/validation/query-param.decorator';
import { Type } from 'class-transformer';
import { IsString } from 'class-validator';

export class StampedQueryDto extends PaginationQueryDto {
	@QueryParam()
	@IsDbDate()
	fromDate?: string;

	@QueryParam()
	@IsDbDate()
	toDate?: string;

	@QueryParam()
	@IsString()
	stamped?: string;

	@QueryParam()
	@Type(() => Number)
	@IsId('El identificador del stock no es valido')
	stockId?: number;
}
