import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTagDto {
    @IsString()
    @ApiProperty({ example: "Antipulgas" })
    name: string;
}
