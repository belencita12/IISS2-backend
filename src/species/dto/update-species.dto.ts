import { PartialType } from '@nestjs/swagger';
import { CreateSpeciesDto } from './create-species.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateSpeciesDto extends PartialType(CreateSpeciesDto) {
    @IsOptional()
    @IsString()
    name?: string;
}
