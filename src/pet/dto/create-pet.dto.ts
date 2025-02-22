import { IsString, IsNumber, IsOptional, IsDateString } from "class-validator";

export class CreatePetDto {
    @IsString()
    name: string;
    
    @IsNumber()
    speciesId: number;

    @IsNumber()
    raceId: number;

    @IsNumber()
    weight: number;

    @IsOptional()
    @IsNumber()
    profileImg?: number;

    @IsDateString()
    dateOfBirth: Date;

    @IsNumber()
    vaccinationBookletId: number;
}
