export interface ProductDetail {
	iva: number;
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
