import { ApiProperty } from '@nestjs/swagger';

export class PetDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  speciesId: number;

  @ApiProperty()
  raceId: number;

  @ApiProperty()
  weight: number;

  @ApiProperty()
  profileImg?: string;

  @ApiProperty()
  dateOfBirth: Date;

  @ApiProperty()
  vaccinationBookletId?: number;
  @ApiProperty()
  deletedAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(pet: any) {
    Object.assign(this, pet);
  }
}
