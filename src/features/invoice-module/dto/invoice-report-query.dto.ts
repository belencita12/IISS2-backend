import { IsDbDate } from '@lib/decorators/validation/is-db-date.decorator';
import { QueryParam } from '@lib/decorators/validation/query-param.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString } from 'class-validator';

export class InvoiceReportQueryDto {
	@IsDbDate()
	@ApiProperty({ example: '2025-01-01' })
	from: string;

	@IsDbDate()
	@ApiProperty({ example: '2025-12-31' })
	to: string;

	@Type(() => Number)
	@QueryParam()
	fromTotal?: number;

	@Type(() => Number)
	@QueryParam()
	toTotal?: number;

	@QueryParam()
	@IsString()
	search?: string;
}
