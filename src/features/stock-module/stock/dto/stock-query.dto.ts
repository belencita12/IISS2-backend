import { PaginationQueryDto } from '@lib/commons/pagination-params.dto';
import { QueryParam } from '@lib/decorators/validation/query-param.decorator';
import { IsString } from 'class-validator';

export class StockQueryDto extends PaginationQueryDto {
	@IsString()
	@QueryParam()
	name?: string;

	@IsString()
	@QueryParam()
	address?: string;

	@IsString()
	@QueryParam()
	stamped?: string;
}
