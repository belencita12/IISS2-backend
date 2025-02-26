import { PartialType } from '@nestjs/mapped-types';
import { CreatePetDto } from './create-pet.dto';
import { ApiProperty} from '@nestjs/swagger';
import { IsDateString, IsIn, IsNumber, IsPositive, IsString } from 'class-validator';

export class UpdatePetDto extends PartialType(CreatePetDto) {
  @ApiProperty({ example: 'Luna' })
  @IsString()
  name?: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  speciesId?: number;

  @ApiProperty({ example: 2 })
  @IsNumber()
  raceId?: number;

  @ApiProperty({ example: 4.5 })
  @IsNumber()
  @IsPositive({ message: 'El peso debe ser un número positivo' })
  weight?: number;

  @ApiProperty({ example: 'Macho' })
  @IsString()
  @IsIn(['Macho', 'Hembra'], { message: 'El sexo debe ser Male, Female o Other' })
  sex?: string;

  @ApiProperty({ example: "https://image.url/profile.jpg" })
  @IsString()
  profileImg?: string;

  @ApiProperty({ example: "2020-05-15T00:00:00.000Z" })
  @IsDateString()
  dateOfBirth?: Date;

  @ApiProperty({ example: 10 })
  @IsNumber()
  vaccinationBookletId?: number;
}
