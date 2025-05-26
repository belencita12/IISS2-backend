export interface ProductDetail {
	code: string;
	name: string;
	unitCost: number;
	quantity: number;
	subtotal: number;
}

export interface ClientInfo {
	fullName: string;
	address: string;
	ruc: string;
}

export interface InvoiceData {
	invoiceNumber: string;
	issueDate: Date;
	stamped: string;
	type: string;
	client: ClientInfo;
	products: ProductDetail[];
	totalIVA: number;
	totalToPay: number;
}

export interface ReceiptData {
	receiptNumber: string;
	issueDate: Date;
	amount: number;
	client: {
		fullName: string;
		ruc: string;
	};
	paymentMethods: {
		method: { name: string };
		amount: number;
	}[];
	invoice: {
		invoiceNumber: string;
		issueDate: Date;
		stamped: string;
		type: string;
		totalIVA: number;
		totalToPay: number;
	};
}
