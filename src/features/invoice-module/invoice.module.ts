import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice/invoice.service';
import { InvoiceController } from './invoice/invoice.controller';
import { PrismaModule } from '@features/prisma/prisma.module';
import { InvoiceDetailService } from './invoice-detail/invoice-detail.service';
import { InvoiceDetailController } from './invoice-detail/invoice-detail.controller';
import { ReceiptController } from './receipt/receipt.controller';
import { ReceiptService } from './receipt/receipt.service';

@Module({
	imports: [PrismaModule],
	controllers: [InvoiceController, InvoiceDetailController, ReceiptController],
	providers: [InvoiceService, InvoiceDetailService, ReceiptService],
})
export class InvoiceModule {}
