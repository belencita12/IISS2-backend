import { PaginationQueryDto } from '@lib/commons/pagination-params.dto';
import { IsDbDate } from '@lib/decorators/validation/is-db-date.decorator';
import { QueryParam } from '@lib/decorators/validation/query-param.decorator';
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
}
