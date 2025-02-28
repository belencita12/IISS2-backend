import { PartialType } from '@nestjs/mapped-types';
import { CreatePetDto } from './create-pet.dto';
import { ApiProperty} from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNumber, IsPositive, IsString } from 'class-validator';
import { Sex } from '@prisma/client';

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

  @IsNumber()
  @ApiProperty({ example: 1 })
  userId: number;

  @ApiProperty({ example: 4.5 })
  @IsNumber()
  @IsPositive({ message: 'El peso debe ser un número positivo' })
  weight?: number;


  @IsEnum(Sex, { message: 'El sexo debe ser M o F' }) 
  @ApiProperty({ example: 'M', enum: Sex })
  sex?: Sex;

  @ApiProperty({ example: "https://image.url/profile.jpg" })
  @IsString()
  profileImg?: string;

  @ApiProperty({ example: "2020-05-15T00:00:00.000Z" })
  @IsDateString()
  dateOfBirth?: Date;
}
