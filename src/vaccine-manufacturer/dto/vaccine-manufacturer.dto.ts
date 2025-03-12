import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsDateString, IsOptional } from "class-validator";

export class VaccineManufacturerDto{
    @ApiPropertyOptional()
    id: number;

    @ApiPropertyOptional()
    name: string;

    @Expose()
    @IsDateString()
    @ApiProperty()
    createdAt: Date;
    
    @Expose()
    @IsDateString()
    @ApiProperty()
    updatedAt: Date;
    
    @Expose()
    @IsOptional()
    @IsDateString()
    @ApiPropertyOptional()
    deletedAt: Date | null;

    constructor(partial: Partial<VaccineManufacturerDto>) {
        Object.assign(this, partial);
    }
}