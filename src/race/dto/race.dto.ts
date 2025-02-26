import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";


export class RaceDto{
    @ApiPropertyOptional()
    id: number; 

    @ApiProperty({example: 'Labrador'})
    name: string;

    @ApiProperty({example: 1})
    speciesId: number;

    constructor(partial: Partial<RaceDto>) {
        Object.assign(this, partial);
    }
}