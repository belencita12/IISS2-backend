import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateVaccineBatchDto } from './create-vaccine-batch.dto';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateVaccineBatchDto extends PartialType(CreateVaccineBatchDto) {
    @ApiPropertyOptional()
    @IsString()
    code?: string;
    
    @ApiPropertyOptional()
    @IsNumber()
    manufacturerId?: number;
}
