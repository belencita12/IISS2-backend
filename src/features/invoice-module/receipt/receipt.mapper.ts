import { toDate } from '@lib/utils/date';
import { Receipt, InvoicePaymentMethod, PaymentMethod } from '@prisma/client';

export interface ReceiptEntity extends Receipt {
	paymentMethods: (InvoicePaymentMethod & { method: PaymentMethod })[];
}

export class ReceiptMapper {
	static toDto(data: ReceiptEntity) {
		return {
			id: data.id,
			receiptNumber: data.receiptNumber,
			invoiceId: data.invoiceId,
			issueDate: toDate(data.issueDate),
			total: data.total.toNumber(),
			paymentMethods: data.paymentMethods.map((p) => ({
				method: p.method.name,
				amount: p.amount,
			})),
		};
	}
}
