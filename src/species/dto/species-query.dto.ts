import { ApiPropertyOptional } from '@nestjs/swagger';

export class SpeciesQueryDto {
  @ApiPropertyOptional()
  name?: string;
}