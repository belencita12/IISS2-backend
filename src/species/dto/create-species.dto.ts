import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateSpeciesDto {
    @ApiProperty({example: 'Canino'})
    @IsString()
    name: string;
}
