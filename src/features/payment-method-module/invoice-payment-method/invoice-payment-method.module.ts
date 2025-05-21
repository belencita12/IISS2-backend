import { Module } from '@nestjs/common';
import { InvoicePaymentMethodService } from './payment-invoice-method.service';
import { InvoicePaymentMethodController } from './invoice-payment-method.controller';
import { PrismaModule } from '@features/prisma/prisma.module';

@Module({
	imports: [PrismaModule],
	controllers: [InvoicePaymentMethodController],
	providers: [InvoicePaymentMethodService],
})
export class InvoicePaymentMethodModule {}
