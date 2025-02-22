import { PartialType } from '@nestjs/swagger';
import { CreateRaceDto } from './create-race.dto';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateRaceDto extends PartialType(CreateRaceDto) {
    @IsOptional()
    @IsString()
    name?: string;
    
    @IsOptional()
    @IsNumber()
    speciesId?: number;
}
