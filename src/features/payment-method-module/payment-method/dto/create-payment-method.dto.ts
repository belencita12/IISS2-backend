import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreatePaymentMethodDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    description?: string;
}
