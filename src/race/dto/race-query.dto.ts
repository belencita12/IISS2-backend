import { IsOptional, IsInt, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '@/lib/commons/pagination-params.dto';

export class RaceQueryDto extends PaginationQueryDto{
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string; 

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  speciesId?: number; 
}
