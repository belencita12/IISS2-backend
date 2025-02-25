import { ApiProperty } from '@nestjs/swagger';

export class PetDto {
  @ApiProperty({example: 1})
  id: number;

  @ApiProperty({example: 'Bruce'})
  name: string;

  @ApiProperty({example: 1})
  speciesId: number;

  @ApiProperty({example: 1})
  raceId: number;

  @ApiProperty({example: 12})
  weight: number;

  @ApiProperty({example: 'Macho'})
   sex: string;

  @ApiProperty({ example: "https://image.url/profile.jpg" })
  profileImg?: string;

  @ApiProperty({ example: "2020-05-15T00:00:00.000Z" })
  dateOfBirth: Date;

  @ApiProperty({example: 1})
  vaccinationBookletId?: number;

  constructor(pet: any) {
    Object.assign(this, pet);
  }
}
