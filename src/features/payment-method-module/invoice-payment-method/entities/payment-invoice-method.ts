export class InvoicePaymentMethod {
    id: number;
    methodId: number;
    invoiceId: number;
    amount: number;
    createdAt: Date;
    deletedAt?: Date;
}
