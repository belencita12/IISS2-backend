import { PaginationQueryDto } from '@lib/commons/pagination-params.dto';
import { IsRuc } from '@lib/decorators/is-ruc';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class ProviderQueryDto extends PaginationQueryDto {
    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    query?: string;

}
