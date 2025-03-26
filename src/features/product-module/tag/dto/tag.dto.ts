import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt } from 'class-validator';

export class TagDto {
    @IsInt()
    @ApiProperty()
    id: number;

    @IsString()
    @ApiProperty()
    name: string;
}
