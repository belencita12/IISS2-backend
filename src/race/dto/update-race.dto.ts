import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateRaceDto } from './create-race.dto';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateRaceDto extends PartialType(CreateRaceDto) {
    @ApiProperty({example: 'Labrador'})
    @IsOptional()
    @IsString()
    name?: string;
    
    @ApiProperty({example: 1})
    @IsOptional()
    @IsNumber()
    speciesId?: number;
}
