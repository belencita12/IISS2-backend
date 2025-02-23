import { IsOptional, IsInt, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class PetQueryDto {
  @IsOptional()
  @IsString()
  species?: string;

  @IsOptional()
  @IsString()
  race?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number;
}
