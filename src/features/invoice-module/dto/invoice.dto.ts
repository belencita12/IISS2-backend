import { toDate } from '@lib/utils/date';
import { ApiProperty } from '@nestjs/swagger';
import { Client, Invoice, InvoiceType, User } from '@prisma/client';

export interface InvoiceEnity extends Invoice {
	client: Client & { user: User };
}

export class InvoiceDto {
	@ApiProperty()
	id: number;

	@ApiProperty()
	total: number;

	@ApiProperty()
	totalPayed: number;

	@ApiProperty()
	totalVat: number;

	@ApiProperty()
	invoiceNumber: string;

	@ApiProperty()
	stamped: string;

	@ApiProperty()
	ruc: string;

	@ApiProperty()
	clientName: string;

	@ApiProperty({ enum: InvoiceType })
	type: InvoiceType;

	@ApiProperty({ example: '2025-12-11' })
	issueDate: string;

	constructor(data: InvoiceEnity) {
		this.id = data.id;
		this.ruc = data.client.user.ruc;
		this.clientName = data.client.user.fullName;
		this.invoiceNumber = data.invoiceNumber;
		this.stamped = data.stamped;
		this.issueDate = toDate(data.issueDate);
		this.total = data.total.toNumber();
		this.totalPayed = data.totalPayed.toNumber();
		this.totalVat = data.totalVat.toNumber();
		this.type = data.type;
	}
}
