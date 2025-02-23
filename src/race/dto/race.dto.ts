import { ApiProperty } from "@nestjs/swagger";


export class RaceDto{
    @ApiProperty()
    id: number; 

    @ApiProperty()
    name: string;

    @ApiProperty()
    speciesId: number;
}