import { PaginationQueryDto } from '@/lib/commons/pagination-params.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UserQueryDto extends PaginationQueryDto {
	@IsOptional()
	@IsString()
	@ApiProperty({ required: false })
	email?: string;
}
