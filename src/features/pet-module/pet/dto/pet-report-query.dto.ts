import { IsDbDate } from '@lib/decorators/validation/is-db-date.decorator';
import { IsId } from '@lib/decorators/validation/is-id.decorator';
import { QueryParam } from '@lib/decorators/validation/query-param.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class PetReportQueryDto {
	@IsDbDate()
	@ApiProperty({ example: '2025-02-12' })
	from: string;

	@IsDbDate()
	@ApiProperty({ example: '2025-02-12' })
	to: string;

	@IsId()
	@Type(() => Number)
	@QueryParam({ example: 1 })
	speciesId: number;
}
