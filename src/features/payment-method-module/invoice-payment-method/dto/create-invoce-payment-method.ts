import { IsInt, IsPositive, IsNumber } from 'class-validator';

export class CreateInvoicePaymentMethodDto {
    @IsInt()
    methodId: number;

    @IsInt()
    invoiceId: number;

    @IsNumber()
    @IsPositive()
    amount: number;

    createdAt: Date;
}
