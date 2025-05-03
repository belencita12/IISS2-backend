import { Type } from 'class-transformer';
import { PaginationQueryDto } from '@lib/commons/pagination-params.dto';
import { IsId } from '@lib/decorators/validation/is-id.decorator';
import { QueryParam } from '@lib/decorators/validation/query-param.decorator';
import { IsString } from 'class-validator';

export class PetQueryDto extends PaginationQueryDto {
	@QueryParam()
	@IsString()
	name?: string;

	@Type(() => Number)
	@QueryParam()
	@IsId()
	speciesId?: number;

	@Type(() => Number)
	@QueryParam()
	@IsId()
	raceId?: number;

	@Type(() => Number)
	@QueryParam()
	@IsId()
	clientId?: number;

	@QueryParam()
	@IsString()
	clientName?: string;
}
