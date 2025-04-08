import { ApiProperty } from '@nestjs/swagger';
import { Tag } from '@prisma/client';
import { IsString, IsInt } from 'class-validator';

export class TagDto {
    constructor(data: Tag){
        this.id = data.id;
        this.name = data.name;
    }
    @IsInt()
    @ApiProperty({ example: 1 })
    id: number;

    @IsString()
    @ApiProperty({ example: "Antipulgas" })
    name: string;
}
