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

    @IsString()
    sex: string;

    @IsOptional()
    @IsString()
    profileImg?: string;

    @IsDateString()
    dateOfBirth: Date;

    @IsNumber()
    vaccinationBookletId: number;
}
