import { IsOptional, IsInt, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RaceQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string; 

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  speciesId?: number; 

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number; 

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number; 
}
