import { IsInt, IsPositive, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInvoicePaymentMethodDto {
    @ApiProperty({ example: 1, description: 'ID del método de pago asociado' })
    @IsInt()
    methodId: number;

    @ApiProperty({ example: 10, description: 'ID de la factura asociada' })
    @IsInt()
    invoiceId: number;

    @ApiProperty({ example: 150.75, description: 'Monto aplicado desde este método de pago a la factura' })
    @IsNumber()
    @IsPositive()
    amount: number;

    @ApiProperty({ example: '2025-04-15T10:00:00.000Z', description: 'Fecha de creación del registro' })
    createdAt: Date;
}
