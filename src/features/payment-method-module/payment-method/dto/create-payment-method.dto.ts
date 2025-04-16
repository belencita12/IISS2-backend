import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreatePaymentMethodDto {
    @ApiProperty({ example: 'Tarjeta de crédito' })
    @IsString()
    name: string;

    @ApiProperty({ example: 'Pago mediante tarjeta de crédito', required: false })
    @IsOptional()
    @IsString()
    description?: string;
}
