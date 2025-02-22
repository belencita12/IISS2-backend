import { PartialType } from '@nestjs/swagger';
import { CreatePetDto } from './create-pet.dto';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdatePetDto extends PartialType(CreatePetDto) {
        @IsString()
        @IsOptional()
        name?: string;
        
        @IsOptional()
        @IsNumber()
        speciesId?: number;
    
        @IsOptional()
        @IsNumber()
        raceId?: number;
    
        @IsOptional()
        @IsNumber()
        weight?: number;
    
        @IsOptional()
        @IsNumber()
        profileImg?: number;

        @IsOptional()
        @IsDateString()
        dateOfBirth?: Date;
    
        @IsOptional()
        @IsNumber()
        vaccinationBookletId?: number;
}
