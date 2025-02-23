import { ApiProperty } from "@nestjs/swagger";

export class SpeciesDto{
    @ApiProperty()
    id: number;

    @ApiProperty()
    name: string;

    @ApiProperty({ required: false })
    description?: string;

    constructor(partial: Partial<SpeciesDto>) {
        Object.assign(this, partial);
    }
}