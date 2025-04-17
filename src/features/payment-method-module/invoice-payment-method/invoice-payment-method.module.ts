import { Module } from '@nestjs/common';
import { InvoicePaymentMethodService } from './payment-invoice-method.service';
import { InvoicePaymentMethodController } from './invoice-payment-method.controller';
import { PrismaService } from '@features/prisma/prisma.service';

@Module({
    controllers: [InvoicePaymentMethodController],
    providers: [InvoicePaymentMethodService, PrismaService],
})
export class InvoicePaymentMethodModule { }
