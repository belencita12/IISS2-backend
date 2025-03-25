import { IsId } from '@lib/decorators/is-id.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Provider } from '@prisma/client';
import { IsString, IsOptional, IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class ProviderDto {
    constructor(data: Provider) {
        this.id = data.id;
        this.businessName = data.businessName;
        this.description = data.description || undefined;
        this.phoneNumber = data.phoneNumber;
        this.ruc = data.ruc;
    }

    @IsId()
    @ApiProperty({ example: 1 })
    id: number;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'Tech Supplies Inc.' })
    businessName: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ example: 'Proveedor de equipos tecnológicos' })
    description?: string;

    @IsPhoneNumber()
    @IsNotEmpty()
    @ApiProperty({ example: '+595972456892' })
    phoneNumber: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: '12345678-1' })
    ruc: string;
}
