import { ApiProperty } from '@nestjs/swagger';
import { ReceiptPayMethodDto } from './receipt-pay-method.dto';
import { InvoicePaymentMethod, PaymentMethod, Receipt } from '@prisma/client';
import { toDate } from '@lib/utils/date';

export interface ReceiptEntity extends Receipt {
	paymentMethods: (InvoicePaymentMethod & { method: PaymentMethod })[];
}

export class ReceiptDto {
	@ApiProperty()
	id: number;

	@ApiProperty()
	receiptNumber: string;

	@ApiProperty()
	invoiceId: number;

	@ApiProperty({ example: '2025-04-12' })
	issueDate: string;

	@ApiProperty()
	total: number;

	@ApiProperty({ type: [ReceiptPayMethodDto] })
	paymentMethods: ReceiptPayMethodDto[];

	constructor(data: ReceiptEntity) {
		this.id = data.id;
		this.receiptNumber = data.receiptNumber;
		this.invoiceId = data.invoiceId;
		this.issueDate = toDate(data.issueDate);
		this.total = data.total.toNumber();
		this.paymentMethods = data.paymentMethods.map((p) => ({
			method: p.method.name,
			amount: p.amount,
		}));
	}
}
