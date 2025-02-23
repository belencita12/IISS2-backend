import { PartialType } from '@nestjs/mapped-types';
import { CreatePetDto } from './create-pet.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePetDto extends PartialType(CreatePetDto) {
  @ApiPropertyOptional({ example: "Luna" })
  name?: string;

  @ApiPropertyOptional({ example: 1 })
  speciesId?: number;

  @ApiPropertyOptional({ example: 2 })
  raceId?: number;

  @ApiPropertyOptional({ example: 4.5 })
  weight?: number;

  @ApiPropertyOptional({ example: 4.5 })
  sex?: string;

  @ApiPropertyOptional({ example: "https://image.url/profile.jpg" })
  profileImg?: string;

  @ApiPropertyOptional({ example: "2020-05-15T00:00:00.000Z" })
  dateOfBirth?: Date;

  @ApiPropertyOptional({ example: 10 })
  vaccinationBookletId?: number;
}
