import { ApiProperty } from '@nestjs/swagger';

export class InvoicePaymentMethodDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 2 })
    methodId: number;

    @ApiProperty({ example: 10 })
    invoiceId: number;

    @ApiProperty({ example: 1500.75 })
    amount: number;

    @ApiProperty({ example: '2024-04-15T10:00:00.000Z' })
    createdAt: Date;

    @ApiProperty({ example: null, required: false })
    deletedAt?: Date | null;
}
