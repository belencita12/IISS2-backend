import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNumber, IsOptional, IsDateString, IsIn, IsPositive } from "class-validator";

export class CreatePetDto {
    @IsString()
    @ApiProperty({example: 'Bruce'})
    name: string;
    
    @IsNumber()
    @ApiProperty({example: 1})
    speciesId: number;

    @IsNumber()
    @ApiProperty({example: 1})
    raceId: number;

    @IsNumber()
    @ApiProperty({example: 12})
    @IsPositive({message: 'El peso debe ser un número positivo'})
    weight: number;

    @IsString()
    @ApiProperty({example: 'Macho'})
    @IsIn(['Macho','Hembra'], {message:'El sexo debe ser macho o hembra'})
    sex: string;

    @IsOptional()
    @ApiProperty({ example: "https://image.url/profile.jpg" })
    @IsString()
    profileImg?: string;

    @IsDateString()
    @ApiProperty({ example: "2020-05-15T00:00:00.000Z" })
    dateOfBirth: Date;

    @IsNumber()
    @ApiProperty({example: 1})
    vaccinationBookletId: number;
}
