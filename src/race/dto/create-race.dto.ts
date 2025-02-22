import { IsNumber, IsString } from "class-validator"

export class CreateRaceDto {
    @IsString()
    name: string;
    
    @IsNumber()
    speciesId: number;
}
