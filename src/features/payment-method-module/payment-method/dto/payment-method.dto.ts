import { ApiProperty } from '@nestjs/swagger';

export class PaymentMethodDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 'Tarjeta de crédito' })
    name: string;

    @ApiProperty({ example: 'Pago mediante tarjeta de crédito', required: false })
    description?: string;

    @ApiProperty({ example: '2024-04-15T10:00:00.000Z' })
    createdAt: Date;

    @ApiProperty({ example: null, required: false })
    deletedAt?: Date | null;
}
