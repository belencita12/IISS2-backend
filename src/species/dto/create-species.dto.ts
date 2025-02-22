import { IsString } from "class-validator";

export class CreateSpeciesDto {
    @IsString()
    name: string;
}
