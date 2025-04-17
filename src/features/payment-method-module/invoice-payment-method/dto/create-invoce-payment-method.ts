import { IsInt, IsPositive, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsId } from '@lib/decorators/validation/is-id.decorator';

export class CreateInvoicePaymentMethodDto {
    @ApiProperty()
    @IsId()
    methodId: number;

    @ApiProperty()
    @IsId()
    invoiceId: number;

    @ApiProperty()
    @IsNumber()
    @IsPositive()
    amount: number;
}
